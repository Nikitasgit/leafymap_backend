import { z } from "zod";
import {
  baseFormDataSchema,
  defaultScheduleSchema,
  nameSchema,
  phoneSchema,
  emailSchema,
} from "./placeValidations";

export const addCreatorSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  placeCategory: z.string().optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
      label: z.string().min(1, "L'emplacement est requis"),
      id: z.string().min(1, "L'ID de l'emplacement est requis"),
    })
    .optional()
    .nullable(),
  placeType: z.array(z.enum(["food", "art", "craft"])).optional(),
  placeActive: z.boolean().optional(),
  userType: z.enum(["creator", "organizer", "guest"]),
  defaultSchedule: defaultScheduleSchema.optional(),
});

export const updateCreatorSchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  phone: phoneSchema,
  email: emailSchema,
  website: z.string().optional(),
  category: z.string().min(1, "La catégorie est requise"),
  placeCategory: z.string().optional(),
  location: z
    .object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
      label: z.string().min(1, "L'emplacement est requis"),
      id: z.string().min(1, "L'ID de l'emplacement est requis"),
    })
    .optional()
    .nullable(),
  placeType: z.array(z.enum(["food", "art", "craft"])).optional(),
  placeActive: z.boolean().optional(),
  userType: z.enum(["creator", "organizer", "guest"]),
  defaultSchedule: defaultScheduleSchema.optional(),
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
