import { z } from "zod";

export const markNotificationsAsReadSchema = z.object({
  action: z.string().min(1, "action est requis (ex: partnership_invitation)"),
});
