import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import type MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { IDecodedToken } from "@src/api/types/custom";
import logger from "@src/shared/logger";
import { ALLOWED_ORIGINS } from "@src/shared/constants/common";

interface SocketData {
  userId: string;
  userType: string;
}

class SocketService {
  private io: SocketIOServer;
  private userRepository: IUserRepository;
  private markMessagesAsReadUseCase: MarkMessagesAsReadUseCase;

  constructor(
    httpServer: HTTPServer,
    userRepository: IUserRepository,
    markMessagesAsReadUseCase: MarkMessagesAsReadUseCase
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
    this.markMessagesAsReadUseCase = markMessagesAsReadUseCase;
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

          const user = await this.userRepository.findById(
            UserId.from(decoded.id)
          );

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
            const { markedCount } =
              await this.markMessagesAsReadUseCase.execute({
                conversationId,
                userId,
              });

            if (markedCount > 0) {
              logger.info(
                `Marked ${markedCount} message(s) as read for user ${userId} in conversation ${conversationId}`
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

  emitNewMessage(
    conversationId: string,
    message: Record<string, unknown>
  ) {
    this.io.to(`conversation:${conversationId}`).emit("new_message", message);
    logger.info(`New message emitted to conversation ${conversationId}`);
  }

  getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketService;
