import { z } from "zod";
import { isValidObjectId } from "@src/api/http/objectId";

export const objectIdString = z
  .string()
  .min(1)
  .refine(isValidObjectId, { message: "Invalid ObjectId" });
