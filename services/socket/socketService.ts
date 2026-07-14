import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { IDecodedToken } from "@/types/custom";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { Types } from "mongoose";
import { IMessage } from "@/types/models/message";
import logger from "@/utils/logger";
import { ALLOWED_ORIGINS } from "@/utils/constants/common";

interface SocketData {
  userId: string;
  userType: string;
}

class SocketService {
  private io: SocketIOServer;
  private userRepository: IUserRepository;
  private messageRepository: IMessageRepository;

  constructor(
    httpServer: HTTPServer,
    userRepository: IUserRepository,
    messageRepository: IMessageRepository
  ) {
    const allowedOrigins = ALLOWED_ORIGINS;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.userRepository = userRepository;
    this.messageRepository = messageRepository;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket: Socket, next: (err?: Error) => void) => {
      void (async () => {
      try {
        const parseCookies = (
          cookieHeader: string | undefined
        ): Record<string, string> => {
          const cookies: Record<string, string> = {};
          if (!cookieHeader) return cookies;
          cookieHeader.split(";").forEach((cookie) => {
            const parts = cookie.trim().split("=");
            if (parts.length === 2) {
              cookies[parts[0]] = decodeURIComponent(parts[1]);
            }
          });

          return cookies;
        };

        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = socket.handshake.auth.token || cookies.token;

        logger.info("Socket connection attempt", {
          hasAuthToken: !!socket.handshake.auth.token,
          hasCookies: !!socket.handshake.headers.cookie,
          cookieKeys: Object.keys(cookies),
          hasToken: !!token,
        });

        if (!token) {
          logger.warn("No token found in Socket.io handshake", {
            headers: socket.handshake.headers,
            auth: socket.handshake.auth,
          });
          return next(new Error("Authentication error: No token provided"));
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          return next(new Error("JWT_SECRET is not defined"));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as IDecodedToken;

        if (!decoded) {
          return next(new Error("Invalid token"));
        }

        const user = await this.userRepository.findById(decoded.id, ["_id"]);

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.data = {
          userId: decoded.id,
          userType: decoded.userType,
        } as SocketData;

        next();
      } catch (error) {
        logger.error("Socket authentication error:", error);
        next(new Error("Authentication error"));
      }
      })();
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket & { data: SocketData }) => {
      const userId = socket.data.userId;
      logger.info(`User ${userId} connected to Socket.io`);

      socket.on("join_conversation", (conversationId: string) => {
        void (async () => {
        const room = `conversation:${conversationId}`;
        void socket.join(room);
        logger.info(`User ${userId} joined conversation ${conversationId}`);

        try {
          const userIdObjectId = new Types.ObjectId(userId);
          const unreadMessages = await this.messageRepository.findAll({
            filters: {
              conversation: conversationId,
              sender: { $ne: userIdObjectId },
              readBy: { $nin: [userIdObjectId] },
            },
            project: ["_id"],
          });

          for (const message of unreadMessages) {
            await this.messageRepository.markAsReadByUser(
              message._id.toString(),
              userId
            );
          }

          if (unreadMessages.length > 0) {
            logger.info(
              `Marked ${unreadMessages.length} message(s) as read for user ${userId} in conversation ${conversationId}`
            );
          }
        } catch (error) {
          logger.error(
            `Error marking messages as read for user ${userId} in conversation ${conversationId}:`,
            error
          );
        }
        })();
      });

      socket.on("leave_conversation", (conversationId: string) => {
        const room = `conversation:${conversationId}`;
        void socket.leave(room);
        logger.info(`User ${userId} left conversation ${conversationId}`);
      });

      socket.on("disconnect", () => {
        logger.info(`User ${userId} disconnected from Socket.io`);
      });

      socket.on("error", (error) => {
        logger.error(`Socket error for user ${userId}:`, error);
      });
    });
  }

  emitNewMessage(conversationId: string, message: Partial<IMessage>) {
    this.io.to(`conversation:${conversationId}`).emit("new_message", message);
    logger.info(`New message emitted to conversation ${conversationId}`);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;
