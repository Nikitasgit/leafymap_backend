import { z } from "zod";
import { NOTIFICATION_ACTIONS } from "@src/domain/value-objects/NotificationAction.vo";

export const markNotificationsAsReadSchema = z.object({
  action: z.enum(NOTIFICATION_ACTIONS, {
    errorMap: () => ({
      message: "action est requis (ex: partnership_invitation)",
    }),
  }),
});
