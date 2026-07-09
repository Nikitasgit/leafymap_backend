import { IMarkMessagesAsReadAction } from "@/actions/messages/MarkMessagesAsRead.action";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const MarkMessagesAsReadController = (
  markMessagesAsReadAction: IMarkMessagesAsReadAction
): Controller =>
  createController({
    execute: async (req) => {
      const result = await markMessagesAsReadAction.execute({
        conversationId: requireObjectIdParam(req, "conversationId"),
        userId: requireAuth(req).id,
      });
      return { markedCount: result.markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} message(s) marqué(s) comme lu(s)`,
  });

export default MarkMessagesAsReadController;
