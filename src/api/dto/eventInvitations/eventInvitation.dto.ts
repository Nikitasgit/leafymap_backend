import { z } from "zod";
import { EVENT_INVITATION_STATUSES } from "@src/domain/value-objects/EventInvitationStatus.vo";
import { isValidObjectId } from "@/utils/objectId";

const objectIdString = z
  .string()
  .min(1)
  .refine(isValidObjectId, { message: "Invalid ObjectId" });

const booleanQuery = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => v === "true");

export const createEventInvitationsSchema = z.object({
  eventInvitations: z
    .array(
      z.object({
        collaborator: z.object({
          _id: objectIdString,
        }),
      })
    )
    .min(1, "Au moins une invitation est requise"),
});

export const updateEventInvitationsSchema = z.object({
  eventInvitations: z
    .array(
      z.object({
        _id: objectIdString,
        deleted: z.boolean().optional(),
        status: z.enum(EVENT_INVITATION_STATUSES).optional(),
      })
    )
    .min(1, "Au moins une invitation est requise"),
});

export const getEventInvitationsQuerySchema = z.object({
  onlyAccepted: booleanQuery,
});

export const getEventInvitationsByUserIdQuerySchema = z.object({
  asCollaborator: booleanQuery,
  includeCancelledEvents: booleanQuery,
  includePastEvents: booleanQuery,
  onlyAccepted: booleanQuery,
  onlyPending: booleanQuery,
});
