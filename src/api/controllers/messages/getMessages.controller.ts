import { getMessagesQuerySchema } from "@src/api/dto/messages/message.dto";
import type GetMessagesUseCase from "@src/application/usecases/messages/GetMessages.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetMessagesController = (
  getMessagesUseCase: GetMessagesUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const query = validateOrThrow(getMessagesQuerySchema, req.query);
      return getMessagesUseCase.execute({
        conversationId: requireObjectIdParam(req, "conversationId"),
        userId: requireAuth(req).id,
        senderId: query.senderId,
        readByUserId: query.readByUserId,
      });
    },
    successMessage: "Messages récupérés avec succès",
  });

export default GetMessagesController;
