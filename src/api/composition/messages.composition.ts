import CreateMessageController from "@src/api/controllers/messages/createMessage.controller";
import DeleteMessageController from "@src/api/controllers/messages/deleteMessage.controller";
import GetConversationWithUserController from "@src/api/controllers/messages/getConversationWithUser.controller";
import GetConversationsController from "@src/api/controllers/messages/getConversations.controller";
import GetMessagesController from "@src/api/controllers/messages/getMessages.controller";
import MarkMessagesAsReadController from "@src/api/controllers/messages/markMessagesAsRead.controller";
import UpdateMessageController from "@src/api/controllers/messages/updateMessage.controller";
import CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import GetConversationWithUserUseCase from "@src/application/usecases/messages/GetConversationWithUser.usecase";
import GetConversationsUseCase from "@src/application/usecases/messages/GetConversations.usecase";
import GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";
import {
  authMiddleware,
  messageRealtimePublisher,
  mongooseConversationRepository,
  mongooseMessageRepository,
  rateLimiterMiddleware,
} from "@src/di/container";

const createMessageUseCase = new CreateMessageUseCase(
  mongooseMessageRepository,
  mongooseConversationRepository,
  messageRealtimePublisher
);
const updateMessageUseCase = new UpdateMessageUseCase(
  mongooseMessageRepository
);
const deleteMessageUseCase = new DeleteMessageUseCase(
  mongooseMessageRepository
);
const getMessagesUseCase = new GetMessagesUseCase(
  mongooseMessageRepository,
  mongooseConversationRepository
);
const getConversationsUseCase = new GetConversationsUseCase(
  mongooseConversationRepository
);
const getConversationWithUserUseCase = new GetConversationWithUserUseCase(
  mongooseConversationRepository
);
export const markMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(
  mongooseMessageRepository,
  mongooseConversationRepository
);

export { authMiddleware, rateLimiterMiddleware };

export const createMessage = CreateMessageController(createMessageUseCase);
export const updateMessage = UpdateMessageController(updateMessageUseCase);
export const deleteMessage = DeleteMessageController(deleteMessageUseCase);
export const getMessages = GetMessagesController(getMessagesUseCase);
export const getConversations = GetConversationsController(
  getConversationsUseCase
);
export const getConversationWithUser = GetConversationWithUserController(
  getConversationWithUserUseCase
);
export const markMessagesAsRead = MarkMessagesAsReadController(
  markMessagesAsReadUseCase
);
