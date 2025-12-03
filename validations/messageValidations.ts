import { z } from "zod";

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
  reference: z.string().min(1, "La référence (review) est requise"),
  referenceType: z.literal("Review", {
    errorMap: () => ({ message: "Le type de référence doit être Review" }),
  }),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
