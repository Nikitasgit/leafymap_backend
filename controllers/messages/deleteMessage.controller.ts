import { IDeleteMessageAction } from "@/actions/messages";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteMessageController = (
  deleteMessageAction: IDeleteMessageAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteMessageAction.execute({
        messageId: requireObjectIdParam(req, "messageId"),
      });
    },
    successMessage: "Message supprimé avec succès",
  });

export default DeleteMessageController;
