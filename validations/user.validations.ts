import { z } from "zod";
import {
  websiteSchema,
  descriptionSchema,
  firstnameSchema,
  lastnameSchema,
  phoneSchema,
} from "./common.validations";

const emptyToUndefined = (val: unknown) =>
  val === "" || val === null ? undefined : val;

export const usernameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(30, "Le nom ne peut pas dépasser 30 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '",
  );

const userCategorySchema = z
  .string()
  .min(1, "Veuillez sélectionner une catégorie");

export const newCreatorSchema = z.object({
  userType: z.literal("creator"),
  username: usernameSchema,
  userCategory: userCategorySchema,
  description: descriptionSchema,
  website: z.preprocess(emptyToUndefined, websiteSchema.optional()),
  phone: phoneSchema.optional(),
  firstname: z.preprocess(emptyToUndefined, firstnameSchema),
  lastname: z.preprocess(emptyToUndefined, lastnameSchema),
});
