import { z } from "zod";
import {
  baseFormDataSchema,
  defaultScheduleSchema,
  nameSchema,
  phoneSchema,
  emailSchema,
} from "./placeValidations";

export const addCreatorSchema = baseFormDataSchema.extend({
  name: nameSchema,
  category: z.string().min(1, "La catégorie est requise"),
  phone: phoneSchema,
  email: emailSchema,
  defaultSchedule: defaultScheduleSchema.optional(),
});

export const updateCreatorSchema = baseFormDataSchema.extend({
  name: nameSchema.optional(),
  category: z.string().optional(),
  defaultSchedule: defaultScheduleSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
});

export const findCreatorsQuerySchema = z.object({
  name: z.string().optional(),
  limit: z.string().regex(/^\d+$/, "La limite doit être un nombre").optional(),
});

export const getUserInPlacesAndEventsQuerySchema = z.object({
  userId: z.string().min(1, "userId parameter is required"),
});

export type AddCreatorInput = z.infer<typeof addCreatorSchema>;
export type UpdateCreatorInput = z.infer<typeof updateCreatorSchema>;
export type FindCreatorsQuery = z.infer<typeof findCreatorsQuerySchema>;
export type GetUserInPlacesAndEventsQuery = z.infer<
  typeof getUserInPlacesAndEventsQuerySchema
>;
