import { z } from "zod";
import { emailSchema } from "./common.validations";

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
  acceptedCGU: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les Conditions Générales d'Utilisation",
  }),
});

const identifierSchema = z
  .string()
  .min(1, "L'identifiant est requis")
  .refine(
    (val) => {
      const emailResult = emailSchema.safeParse(val);
      if (emailResult.success) return true;

      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      return usernameRegex.test(val);
    },
    {
      message:
        "L'identifiant doit être un email valide ou un nom d'utilisateur valide (3-30 caractères, lettres, chiffres, tirets et underscores uniquement)",
    }
  );

export const loginSchema = z.object({
  identifier: identifierSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});
