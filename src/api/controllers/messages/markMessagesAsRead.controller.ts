import type MarkMessagesAsReadUseCase from "@src/application/usecases/messages/MarkMessagesAsRead.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const MarkMessagesAsReadController = (
  markMessagesAsReadUseCase: MarkMessagesAsReadUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { markedCount } = await markMessagesAsReadUseCase.execute({
        conversationId: requireObjectIdParam(req, "conversationId"),
        userId: requireAuth(req).id,
      });
      return { markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} message(s) marqué(s) comme lu(s)`,
  });

export default MarkMessagesAsReadController;
