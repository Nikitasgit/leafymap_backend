import { z } from "zod";

export const getEventInvitationsQuerySchema = z.object({
  onlyAccepted: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export const getEventInvitationsByUserIdQuerySchema = z.object({
  asCollaborator: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  includeCancelledEvents: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  includePastEvents: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  onlyAccepted: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  onlyPending: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
