import { updateMessageSchema } from "@src/api/dto/messages/message.dto";
import type UpdateMessageUseCase from "@src/application/usecases/messages/UpdateMessage.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateMessageController = (
  updateMessageUseCase: UpdateMessageUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { content } = validateOrThrow(updateMessageSchema, req.body);
      await updateMessageUseCase.execute({
        messageId: requireObjectIdParam(req, "messageId"),
        userId: requireAuth(req).id,
        content,
      });
    },
    successMessage: "Message modifié avec succès",
  });

export default UpdateMessageController;
