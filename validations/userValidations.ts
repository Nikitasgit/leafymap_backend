import { z } from "zod";
import {
  ValidationResult,
  websiteSchema,
  descriptionSchema,
} from "./commonValidations";
import { IUser } from "types/models";

export const creatorNameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(40, "Le nom ne peut pas dépasser 40 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

/* const usernameSchema = z
  .string()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
  );
*/
const creatorCategoriesSchema = z
  .array(z.string())
  .min(1, "Veuillez sélectionner une catégorie");

const newCreatorSchema = z.object({
  userType: z.literal("creator"),
  creatorName: creatorNameSchema,
  creatorCategories: creatorCategoriesSchema,
  description: descriptionSchema,
  website: websiteSchema.optional(),
});

const newOrganizerSchema = z.object({
  userType: z.literal("organizer"),
});

export const validateNewUserData = (data: Partial<IUser>): ValidationResult => {
  const errors: Record<string, string> = {};

  let result;
  if (data.userType === "creator") {
    result = newCreatorSchema.safeParse(data);
  } else if (data.userType === "organizer") {
    result = newOrganizerSchema.safeParse(data);
  }
  if (result && !result.success) {
    result.error.errors.forEach((err) => {
      const field = err.path.join(".");
      errors[field] = err.message;
    });
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
