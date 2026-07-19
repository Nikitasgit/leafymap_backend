import type DeleteMessageUseCase from "@src/application/usecases/messages/DeleteMessage.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteMessageController = (
  deleteMessageUseCase: DeleteMessageUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deleteMessageUseCase.execute({
        messageId: requireObjectIdParam(req, "messageId"),
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Message supprimé avec succès",
  });

export default DeleteMessageController;
