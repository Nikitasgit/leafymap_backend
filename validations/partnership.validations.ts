import { z } from "zod";

const partnershipStatusEnum = z.enum([
  "pending",
  "accepted",
  "refused",
  "cancelled",
  "completed",
]);

export const getPartnershipsByUserIdQuerySchema = z.object({
  asCollaborator: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  asInitiator: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
  status: partnershipStatusEnum.optional(),
});
