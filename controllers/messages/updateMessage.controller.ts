import { updateMessageSchema } from "../../validations/message.validations";
import { IUpdateMessageAction } from "@/actions/messages";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateMessageController = (
  updateMessageAction: IUpdateMessageAction
): Controller =>
  createController({
    execute: async (req) => {
      await updateMessageAction.execute({
        messageId: requireObjectIdParam(req, "messageId"),
        messageData: validateOrThrow(updateMessageSchema, req.body),
      });
    },
    successMessage: "Message modifié avec succès",
  });

export default UpdateMessageController;
