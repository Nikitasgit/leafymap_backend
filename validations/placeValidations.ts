import { z } from "zod";
import {
  descriptionSchema,
  emailSchema,
  phoneSchema,
  ValidationResult,
  websiteSchema,
} from "./commonValidations";
import { IPlace } from "types/models";

export const placeNameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(40, "Le nom ne peut pas dépasser 40 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

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
  .array(z.enum(["art", "food", "craft"]))
  .min(1, "Le type de lieu est requis");

const newPlaceSchema = z.object({
  placeCategory: placeCategorySchema,
  location: locationSchema,
  active: z.boolean(),
  name: placeNameSchema,
});

const newOrganizerPlaceSchema = newPlaceSchema.extend({
  email: emailSchema,
  active: z.literal(true),
  website: websiteSchema.optional(),
  phone: phoneSchema,
  placeType: placeTypeSchema,
  description: descriptionSchema,
});

export const validateNewPlaceData = (
  data: Partial<IPlace>,
  userType: "organizer" | "creator" | "guest"
): ValidationResult => {
  const errors: Record<string, string> = {};
  let placeSchema;
  if (userType === "organizer") {
    placeSchema = newOrganizerPlaceSchema;
  } else {
    placeSchema = newPlaceSchema;
  }
  const result = placeSchema.safeParse(data);
  if (!result.success) {
    result.error.errors.forEach((err) => {
      const field = err.path.join(".");
      errors[field] = err.message;
    });
  }

  if (!data.location) {
    errors.location = "L'adresse du lieu est obligatoire";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
