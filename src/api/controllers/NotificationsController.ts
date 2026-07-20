import { RequestHandler } from "express";
import { markNotificationsAsReadSchema } from "@src/api/dto/notifications/notification.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import type MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import type MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";

class NotificationsController extends BaseHttpController {
  constructor(
    private readonly getCurrentUserNotificationsUseCase: GetCurrentUserNotificationsUseCase,
    private readonly markNotificationsAsReadUseCase: MarkNotificationsAsReadUseCase,
    private readonly markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase
  ) {
    super();
  }

  list(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getCurrentUserNotificationsUseCase.execute({
          userId: requireAuth(req).id,
        }),
      successMessage: "Notifications récupérées avec succès",
    });
  }

  markAsRead(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { action } = validateOrThrow(
          markNotificationsAsReadSchema,
          req.body ?? {}
        );
        const { markedCount } = await this.markNotificationsAsReadUseCase.execute(
          {
            action,
            userId: requireAuth(req).id,
          }
        );
        return { markedCount };
      },
      successMessage: ({ markedCount }) =>
        `${markedCount} notification(s) marquée(s) comme lue(s)`,
    });
  }

  markAllAsRead(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { markedCount } =
          await this.markAllNotificationsAsReadUseCase.execute({
            userId: requireAuth(req).id,
          });
        return { markedCount };
      },
      successMessage: ({ markedCount }) =>
        `${markedCount} notification(s) marquée(s) comme lue(s)`,
    });
  }
}

export default NotificationsController;
