import "dotenv/config";
import "tsconfig-paths/register";
import dns from "node:dns";
import app from "@src/main/app";
import connectDB from "@src/infrastructure/persistence/db";
import { createServer } from "http";
import { cradle } from "@src/di/container";
import EventsCronService from "@src/infrastructure/cron/EventsCronService";
import SocketService from "@src/infrastructure/realtime/socketService";
import { setSocketService } from "@src/infrastructure/realtime/socketInstance";

dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT || 3000;

const {
  updateEventLifecycleStatusUseCase,
  markMessagesAsReadUseCase,
  eventInvitationRepository,
  userRepository,
} = cradle;

const httpServer = createServer(app);

const socketService = new SocketService(
  httpServer,
  userRepository,
  markMessagesAsReadUseCase
);
setSocketService(socketService);

const eventsCronService = new EventsCronService(
  updateEventLifecycleStatusUseCase,
  eventInvitationRepository
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
