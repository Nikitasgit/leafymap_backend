import { createMessageSchema } from "@src/api/dto/messages/message.dto";
import type CreateMessageUseCase from "@src/application/usecases/messages/CreateMessage.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateMessageController = (
  createMessageUseCase: CreateMessageUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(createMessageSchema, req.body);
      return createMessageUseCase.execute({
        senderId: requireAuth(req).id,
        recipientId: body.recipientId,
        content: body.content,
      });
    },
    successMessage: "Message créé avec succès",
    successStatus: 201,
  });

export default CreateMessageController;
