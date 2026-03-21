import "tsconfig-paths/register";
import dns from "node:dns";
import app from "./app";
import "dotenv/config";
import { createServer } from "http";
import {
  EventRepository,
  UserRepository,
  MessageRepository,
  EventInvitationRepository,
} from "@/repositories";
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

const eventRepository = new EventRepository();
const eventInvitationRepo = new EventInvitationRepository();
const eventsCronService = new EventsCronService(
  eventRepository,
  eventInvitationRepo
);
eventsCronService.start();

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});
