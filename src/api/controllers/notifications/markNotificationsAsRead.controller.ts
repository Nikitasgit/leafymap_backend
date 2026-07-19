import { markNotificationsAsReadSchema } from "@src/api/dto/notifications/notification.dto";
import type MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const MarkNotificationsAsReadController = (
  markNotificationsAsReadUseCase: MarkNotificationsAsReadUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { action } = validateOrThrow(
        markNotificationsAsReadSchema,
        req.body ?? {}
      );
      const { markedCount } = await markNotificationsAsReadUseCase.execute({
        action,
        userId: requireAuth(req).id,
      });
      return { markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} notification(s) marquée(s) comme lue(s)`,
  });

export default MarkNotificationsAsReadController;
