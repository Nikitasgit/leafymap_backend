import { RequestHandler } from "express";
import {
  createMessageSchema,
  getMessagesQuerySchema,
  updateMessageSchema,
} from "@src/api/dto/messages/message.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import type DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import type GetConversationWithUserUseCase from "@src/application/usecases/messages/GetConversationWithUser.usecase";
import type GetConversationsUseCase from "@src/application/usecases/messages/GetConversations.usecase";
import type GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import type MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import type UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";

class MessagesController extends BaseHttpController {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly updateMessageUseCase: UpdateMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase,
    private readonly getMessagesUseCase: GetMessagesUseCase,
    private readonly getConversationsUseCase: GetConversationsUseCase,
    private readonly getConversationWithUserUseCase: GetConversationWithUserUseCase,
    private readonly markMessagesAsReadUseCase: MarkMessagesAsReadUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(createMessageSchema, req.body);
        return this.createMessageUseCase.execute({
          senderId: requireAuth(req).id,
          recipientId: body.recipientId,
          content: body.content,
        });
      },
      successMessage: "Message créé avec succès",
      successStatus: 201,
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { content } = validateOrThrow(updateMessageSchema, req.body);
        await this.updateMessageUseCase.execute({
          messageId: requireObjectIdParam(req, "messageId"),
          userId: requireAuth(req).id,
          content,
        });
      },
      successMessage: "Message modifié avec succès",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deleteMessageUseCase.execute({
          messageId: requireObjectIdParam(req, "messageId"),
          userId: requireAuth(req).id,
        });
      },
      successMessage: "Message supprimé avec succès",
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const query = validateOrThrow(getMessagesQuerySchema, req.query);
        return this.getMessagesUseCase.execute({
          conversationId: requireObjectIdParam(req, "conversationId"),
          userId: requireAuth(req).id,
          senderId: query.senderId,
          readByUserId: query.readByUserId,
        });
      },
      successMessage: "Messages récupérés avec succès",
    });
  }

  listConversations(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getConversationsUseCase.execute({
          userId: requireAuth(req).id,
        }),
      successMessage: "Conversations récupérées avec succès",
    });
  }

  getConversationWithUser(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getConversationWithUserUseCase.execute({
          userId: requireAuth(req).id,
          otherUserId: requireObjectIdParam(req, "otherUserId"),
        }),
      successMessage: "Conversation check completed successfully",
    });
  }

  markAsRead(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { markedCount } = await this.markMessagesAsReadUseCase.execute({
          conversationId: requireObjectIdParam(req, "conversationId"),
          userId: requireAuth(req).id,
        });
        return { markedCount };
      },
      successMessage: ({ markedCount }) =>
        `${markedCount} message(s) marqué(s) comme lu(s)`,
    });
  }
}

export default MessagesController;
