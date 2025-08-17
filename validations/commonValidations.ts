import { z } from "zod";

export const nameSchema = z
  .string()
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(40, "Le nom ne peut pas dépasser 40 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

export const descriptionSchema = z
  .string()
  .min(10, "La description doit contenir au moins 10 caractères")
  .max(300, "La description ne peut pas dépasser 300 caractères");
