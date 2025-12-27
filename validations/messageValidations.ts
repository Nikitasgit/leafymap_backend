import { z } from "zod";

export const createMessageSchema = z.object({
  recipientId: z.string().min(1, "Le destinataire est requis"),
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
  isRead: z.boolean().optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
