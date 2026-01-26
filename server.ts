import "tsconfig-paths/register";
import app from "./app";
import "dotenv/config";
import { createServer } from "http";
import {
  EventRepository,
  UserRepository,
  MessageRepository,
} from "@/repositories";
import EventsCronService from "@/services/cron/EventsCronService";
import SocketService from "@/services/socket/socketService";
import { setSocketService } from "@/services/socket/socketInstance";

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

const eventRepository = new EventRepository();
const eventsCronService = new EventsCronService(eventRepository);
eventsCronService.start();

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});
