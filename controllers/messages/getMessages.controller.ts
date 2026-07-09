import { getMessagesQuerySchema } from "../../validations/message.validations";
import { IGetMessagesAction } from "@/actions/messages";
import { MessageFilters } from "@/types/repositories/message.repository.types";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";
import { getParam } from "@/utils/request";

const GetMessagesController = (getMessagesAction: IGetMessagesAction): Controller =>
  createController({
    execute: async (req) => {
      const conversationId = getParam(req.params, "conversationId");
      const query = validateOrThrow(getMessagesQuerySchema, req.query);

      const filters: MessageFilters = {};
      if (conversationId) {
        filters.conversation = conversationId;
      }
      if (query.senderId) {
        filters.sender = query.senderId;
      }
      if (query.readByUserId) {
        filters.readBy = query.readByUserId;
      }

      const result = await getMessagesAction.execute({
        filters,
        conversationId,
      });
      return { messages: result.messages };
    },
    successMessage: "Messages récupérés avec succès",
  });

export default GetMessagesController;
