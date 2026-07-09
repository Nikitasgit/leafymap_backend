import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du commentaire est requis")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères"),
  reference: z.string().min(1, "La référence est requise"),
  referenceType: z.enum(["Review", "Image", "Comment"], {
    errorMap: () => ({
      message: "Le type de référence doit être Review, Image ou Comment",
    }),
  }),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du commentaire est requis")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères"),
});

export const getCommentsQuerySchema = z.object({
  reference: z.string().min(1, "Le paramètre 'reference' est requis"),
  referenceType: z.enum(["Review", "Image", "Comment"], {
    errorMap: () => ({
      message: "Le type de référence doit être Review, Image ou Comment",
    }),
  }),
  author: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
