import { z } from "zod";
import { objectIdString } from "@src/api/dto/common.dto";

export const createMessageSchema = z.object({
  recipientId: objectIdString,
  content: z
    .string({ required_error: "Le contenu du message est requis" })
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu du message est requis")
    .max(1000, "Le message ne peut pas dépasser 1000 caractères"),
});

export const getMessagesQuerySchema = z.object({
  senderId: objectIdString.optional(),
  readByUserId: objectIdString.optional(),
});
