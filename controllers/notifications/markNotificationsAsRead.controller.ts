import { markNotificationsAsReadSchema } from "../../validations/notification.validations";
import { IMarkNotificationsAsReadAction } from "@/actions/notifications";
import { NotificationActionType } from "@/types/models/notification";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const MarkNotificationsAsReadController = (
  markNotificationsAsReadAction: IMarkNotificationsAsReadAction
): Controller =>
  createController({
    execute: async (req) => {
      const { action } = validateOrThrow(
        markNotificationsAsReadSchema,
        req.body ?? {}
      );
      const { markedCount } = await markNotificationsAsReadAction.execute({
        action: action as NotificationActionType,
        userId: requireAuth(req).id,
      });
      return { markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} notification(s) marquée(s) comme lue(s)`,
  });

export default MarkNotificationsAsReadController;
