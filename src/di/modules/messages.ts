import { asClass, AwilixContainer } from "awilix";
import MessagesController from "@src/api/controllers/MessagesController";
import CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import GetConversationWithUserUseCase from "@src/application/usecases/messages/GetConversationWithUser.usecase";
import GetConversationsUseCase from "@src/application/usecases/messages/GetConversations.usecase";
import GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerMessagesModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    createMessageUseCase: asClass(CreateMessageUseCase).singleton(),
    updateMessageUseCase: asClass(UpdateMessageUseCase).singleton(),
    deleteMessageUseCase: asClass(DeleteMessageUseCase).singleton(),
    getMessagesUseCase: asClass(GetMessagesUseCase).singleton(),
    getConversationsUseCase: asClass(GetConversationsUseCase).singleton(),
    getConversationWithUserUseCase: asClass(
      GetConversationWithUserUseCase
    ).singleton(),
    markMessagesAsReadUseCase: asClass(MarkMessagesAsReadUseCase).singleton(),

    messagesController: asClass(MessagesController).singleton(),
  });
};
