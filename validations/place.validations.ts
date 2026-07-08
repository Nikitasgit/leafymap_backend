import { z } from "zod";

export const placeCategorySchema = z
  .string()
  .min(1, "La catégorie du lieu est requise");

export const locationSchema = z.object({
  id: z.string(),
  label: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  type: z.literal("Point"),
});

export const placeTypeSchema = z
  .array(z.string().min(1, "Le type de lieu est requis"))
  .min(1, "Le type de lieu est requis");

export const newPlaceSchema = z.object({
  placeCategory: placeCategorySchema,
  placeType: placeTypeSchema,
  location: locationSchema,
  defaultSchedule: z.any().optional(),
  customDates: z.array(z.any()).optional(),
});

export const updatePlaceSchema = newPlaceSchema.partial();
