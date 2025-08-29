import { z } from "zod";
import { emailSchema, ValidationResult } from "./commonValidations";
import { LoginFormData, RegisterFormData } from "types/api/auth.dto";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
    ),
  email: emailSchema,
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
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

export const validateRegisterData = (
  data: RegisterFormData
): ValidationResult => {
  const errors: Record<string, string> = {};
  const result = registerSchema.safeParse(data);
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

export const validateLoginData = (data: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {};
  const result = loginSchema.safeParse(data);
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
