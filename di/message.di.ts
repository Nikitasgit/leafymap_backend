import {
  MessageRepository,
  UserRepository,
  ConversationRepository,
} from "@/repositories";
import {
  CreateMessageAction,
  UpdateMessageAction,
  DeleteMessageAction,
  GetMessagesAction,
  GetConversationsAction,
  GetConversationWithUserAction,
  MarkMessagesAsReadAction,
} from "@/actions/messages";
import {
  CreateMessageController,
  UpdateMessageController,
  DeleteMessageController,
  GetMessagesController,
  GetConversationsController,
  GetConversationWithUserController,
  MarkMessagesAsReadController,
} from "@/controllers/messages";
import {
  AuthMiddleware,
  MessagesMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";
import ConversationMiddleware from "@/middlewares/conversation.middleware";

// Initialize repositories
const messageRepository = new MessageRepository();
const userRepository = new UserRepository();
const conversationRepository = new ConversationRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const messagesMiddleware = new MessagesMiddleware(messageRepository);
export const conversationMiddleware = new ConversationMiddleware(
  conversationRepository
);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createMessageAction = new CreateMessageAction(
  messageRepository,
  conversationRepository
);
const updateMessageAction = new UpdateMessageAction(messageRepository);
const deleteMessageAction = new DeleteMessageAction(messageRepository);
const getMessagesAction = new GetMessagesAction(messageRepository);
const getConversationsAction = new GetConversationsAction(
  conversationRepository,
  messageRepository
);
const getConversationWithUserAction = new GetConversationWithUserAction(
  conversationRepository
);
const markMessagesAsReadAction = new MarkMessagesAsReadAction(
  messageRepository
);

// Initialize controllers
export const createMessage = CreateMessageController(createMessageAction);
export const updateMessage = UpdateMessageController(updateMessageAction);
export const deleteMessage = DeleteMessageController(deleteMessageAction);
export const getMessages = GetMessagesController(getMessagesAction);
export const getConversations = GetConversationsController(
  getConversationsAction
);
export const getConversationWithUser = GetConversationWithUserController(
  getConversationWithUserAction
);
export const markMessagesAsRead = MarkMessagesAsReadController(
  markMessagesAsReadAction
);
