import type MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const MarkAllNotificationsAsReadController = (
  markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { markedCount } = await markAllNotificationsAsReadUseCase.execute({
        userId: requireAuth(req).id,
      });
      return { markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} notification(s) marquée(s) comme lue(s)`,
  });

export default MarkAllNotificationsAsReadController;
