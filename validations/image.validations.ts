import { z } from "zod";

export const getImagesQuerySchema = z.object({
  reference: z.string().min(1, "Le paramètre 'reference' est requis"),
  referenceType: z.string().min(1, "Le paramètre 'referenceType' est requis"),
  type: z.string().optional(),
  user: z.string().optional(),
});
