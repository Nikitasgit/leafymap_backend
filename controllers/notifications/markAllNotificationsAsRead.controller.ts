import { IMarkAllNotificationsAsReadAction } from "@/actions/notifications/MarkAllNotificationsAsRead.action";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const MarkAllNotificationsAsReadController = (
  markAllNotificationsAsReadAction: IMarkAllNotificationsAsReadAction
): Controller =>
  createController({
    execute: async (req) => {
      const { markedCount } = await markAllNotificationsAsReadAction.execute({
        userId: requireAuth(req).id,
      });
      return { markedCount };
    },
    successMessage: ({ markedCount }) =>
      `${markedCount} notification(s) marquée(s) comme lue(s)`,
  });

export default MarkAllNotificationsAsReadController;
