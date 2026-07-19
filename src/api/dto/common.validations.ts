import { z } from "zod";

export const phoneSchema = z
  .string()
  .refine((val) => !val || val.trim() === "" || /^[0-9]{10}$/.test(val), {
    message: "Le numéro de téléphone doit contenir 10 chiffres",
  })
  .transform((val) => (val?.trim() === "" ? undefined : val));

export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("L'email n'est pas valide");

export const websiteSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const urlToValidate = val.replace(/^https?:\/\//, "");
      if (urlToValidate.length < 3) return false;
      if (!urlToValidate.includes(".")) return false;
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(urlToValidate)) return false;
      try {
        let url = val;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "L'URL du site web n'est pas valide",
    },
  );

export const descriptionSchema = z
  .string()
  .min(10, "La description doit contenir au moins 10 caractères")
  .max(300, "La description ne peut pas dépasser 300 caractères");

export const firstnameSchema = z
  .string()
  .max(50, "Le prénom ne peut pas dépasser 50 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes",
  )
  .optional();

export const lastnameSchema = z
  .string()
  .max(50, "Le nom ne peut pas dépasser 50 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    "Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes",
  )
  .optional();
