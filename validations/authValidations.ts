import { z } from "zod";

// Schéma de validation pour l'inscription
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(30, "Le nom d'utilisateur ne peut pas dépasser 30 caractères")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores"
    ),
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide")
    .min(1, "L'email est requis"),
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"
    ),
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  identifier: z.string().min(1, "L'email ou nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Types TypeScript dérivés des schémas
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

// Fonction utilitaire pour valider les données d'inscription
export const validateRegisterData = (data: unknown): RegisterFormData => {
  return registerSchema.parse(data);
};

// Fonction utilitaire pour valider les données de connexion
export const validateLoginData = (data: unknown): LoginFormData => {
  return loginSchema.parse(data);
};

// Fonction pour obtenir les erreurs de validation formatées
export const getValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const field = err.path.join(".");
    errors[field] = err.message;
  });
  return errors;
};
