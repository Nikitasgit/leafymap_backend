import {
  MessageRepository,
  UserRepository,
  PartnershipRepository,
  ConversationRepository,
} from "@/repositories";
import {
  CreateMessageAction,
  UpdateMessageAction,
  DeleteMessageAction,
  GetMessagesAction,
  GetConversationsAction,
} from "@/actions/messages";
import {
  CreateMessageController,
  UpdateMessageController,
  DeleteMessageController,
  GetMessagesController,
  GetConversationsController,
} from "@/controllers/messages";
import {
  AuthMiddleware,
  MessagesMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";

// Initialize repositories
const messageRepository = new MessageRepository();
const userRepository = new UserRepository();
const partnershipRepository = new PartnershipRepository();
const conversationRepository = new ConversationRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const messagesMiddleware = new MessagesMiddleware(messageRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createMessageAction = new CreateMessageAction(
  messageRepository,
  conversationRepository
);
const updateMessageAction = new UpdateMessageAction(messageRepository);
const deleteMessageAction = new DeleteMessageAction(messageRepository);
const getMessagesAction = new GetMessagesAction(
  messageRepository,
  partnershipRepository
);
const getConversationsAction = new GetConversationsAction(
  conversationRepository,
  messageRepository
);

// Initialize controllers
export const createMessage = new CreateMessageController(createMessageAction);
export const updateMessage = new UpdateMessageController(updateMessageAction);
export const deleteMessage = new DeleteMessageController(deleteMessageAction);
export const getMessages = new GetMessagesController(getMessagesAction);
export const getConversations = new GetConversationsController(
  getConversationsAction
);
