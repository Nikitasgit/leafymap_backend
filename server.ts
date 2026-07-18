import "dotenv/config";
import "tsconfig-paths/register";
import dns from "node:dns";
import app from "./app";
import connectDB from "./config/db";
import { createServer } from "http";
import { UserRepository, MessageRepository } from "@/repositories";
import { updateEventLifecycleStatusUseCase } from "@src/api/composition/events.composition";
import { mongooseEventInvitationRepository } from "@/di/container";
import EventsCronService from "@/services/cron/EventsCronService";
import SocketService from "@/services/socket/socketService";
import { setSocketService } from "@/services/socket/socketInstance";

dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const userRepository = new UserRepository();
const messageRepository = new MessageRepository();
const socketService = new SocketService(
  httpServer,
  userRepository,
  messageRepository
);
setSocketService(socketService);

const eventsCronService = new EventsCronService(
  updateEventLifecycleStatusUseCase,
  mongooseEventInvitationRepository
);
eventsCronService.start();

async function bootstrap(): Promise<void> {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`WebSocket server initialized`);
  });
}

void bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
