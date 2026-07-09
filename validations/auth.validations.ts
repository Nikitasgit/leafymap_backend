import { z } from "zod";
import { emailSchema } from "./common.validations";

const isDev = () => process.env.NODE_ENV === "development";

const passwordSchema = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères")
  .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
  );

const devPasswordSchema = z.string().min(1, "Le mot de passe est requis");

export const registerSchema = z.object({
  email: emailSchema,
  password: isDev() ? devPasswordSchema : passwordSchema,
  acceptedCGU: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les Conditions Générales d'Utilisation",
  }),
  emailNotifications: z.boolean().optional().default(false),
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

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
  newPassword: passwordSchema,
});

export const googleAuthSchema = z.object({
  id_token: z.string().min(1, "Le token Google est requis"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Le token est requis"),
});

export const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});

export const acceptCguSchema = z.object({
  emailNotifications: z.boolean().optional(),
});
