import { z } from "zod";
import { objectIdString } from "@src/api/dto/common.dto";
import { IMAGE_REFERENCE_TYPES } from "@src/domain/value-objects/ImageReferenceType.vo";
import { IMAGE_TYPES } from "@src/domain/value-objects/ImageType.vo";

export const getImagesQuerySchema = z.object({
  reference: objectIdString,
  referenceType: z.enum(IMAGE_REFERENCE_TYPES),
  type: z.enum(IMAGE_TYPES).optional(),
  user: objectIdString.optional(),
});

export const uploadImagesBodySchema = z.object({
  reference: objectIdString,
  referenceType: z.enum(IMAGE_REFERENCE_TYPES),
  type: z.enum(IMAGE_TYPES),
});

export const deleteImagesBodySchema = z.object({
  images: z
    .array(
      z.union([
        objectIdString,
        z.object({ _id: objectIdString }),
      ])
    )
    .min(1, "Images requises"),
});
