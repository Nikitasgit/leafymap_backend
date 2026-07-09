import { createMessageSchema } from "../../validations/message.validations";
import { ICreateMessageAction } from "@/actions/messages";
import { getSocketService } from "@/services/socket/socketInstance";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateMessageController = (
  createMessageAction: ICreateMessageAction
): Controller =>
  createController({
    execute: async (req) => {
      const senderId = requireAuth(req).id;
      const result = await createMessageAction.execute({
        messageData: validateOrThrow(createMessageSchema, req.body),
        senderId,
      });

      const socketService = getSocketService();
      if (socketService && result.message) {
        socketService.emitNewMessage(result.conversationId, result.message);
      }

      return { _id: result._id, conversationId: result.conversationId };
    },
    successMessage: "Message créé avec succès",
    successStatus: 201,
  });

export default CreateMessageController;
