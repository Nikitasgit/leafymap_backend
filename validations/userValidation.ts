import { z } from "zod";
import { emailSchema } from "./placeValidations";
import { descriptionSchema, nameSchema } from "./commonValidations";

const addressSchema = z.object({
  number: z
    .string()
    .min(
      1,
      "Le numéro est requis, veuillez indiquer zéro si vous n'avez pas de numéro"
    ),
  street: z.string().min(2, "La rue doit contenir au moins 2 caractères"),
  code: z.string().min(5, "Le code postal doit contenir au moins 5 caractères"),
  extra: z.string().optional(),
});

const usernameSchema = z
  .string()
  .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
  .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
  );

export const baseUserSchema = z.object({
  lastname: nameSchema,
  firstname: nameSchema,
  username: usernameSchema,
  email: emailSchema,
  website: z.string().optional(),
  address: addressSchema.optional(),
  interests: z.array(z.string()).optional(),
  image: z.string().optional(),
  followers: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  country: z.string().optional(),
});

export const creatorSchema = z.object({
  ...baseUserSchema.shape,
  categories: z.array(z.string()).min(1, "Au moins une catégorie est requise"),
  description: descriptionSchema,
});

export const findCreatorsQuerySchema = z.object({
  name: z.string().optional(),
  limit: z.string().regex(/^\d+$/, "La limite doit être un nombre").optional(),
});

export const getUserInPlacesAndEventsQuerySchema = z.object({
  userId: z.string().min(1, "userId parameter is required"),
});

export type FindCreatorsQuery = z.infer<typeof findCreatorsQuerySchema>;
export type GetUserInPlacesAndEventsQuery = z.infer<
  typeof getUserInPlacesAndEventsQuerySchema
>;
