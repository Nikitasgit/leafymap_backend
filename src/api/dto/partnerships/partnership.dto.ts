import { z } from "zod";
import { PARTNERSHIP_STATUSES } from "@src/domain/value-objects/PartnershipStatus.vo";
import { isValidObjectId } from "@/utils/objectId";

const objectIdString = z
  .string()
  .min(1)
  .refine(isValidObjectId, { message: "Invalid ObjectId" });

const booleanQuery = z
  .enum(["true", "false"])
  .optional()
  .transform((v) => v === "true");

export const createPartnershipSchema = z.object({
  partnership: z.object({
    collaborator: z.object({
      _id: objectIdString,
    }),
  }),
});

export const updatePartnershipsSchema = z.object({
  partnerships: z
    .array(
      z.object({
        _id: objectIdString,
        status: z.enum(["pending", "accepted"]).optional(),
      })
    )
    .min(1, "Au moins un partenariat est requis"),
});

export const getPartnershipsByUserIdQuerySchema = z.object({
  asCollaborator: booleanQuery,
  asInitiator: booleanQuery,
  status: z.enum(PARTNERSHIP_STATUSES).optional(),
});
