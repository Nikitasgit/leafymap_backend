import { z } from "zod";

export const locationSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
  label: z.string().min(1, "L'emplacement est requis"),
  id: z.string().min(1, "L'ID de l'emplacement est requis"),
});

const timeSlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
});

const dayScheduleSchema = z.object({
  open: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
});

export const defaultScheduleSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

const createdCollaboratorSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
});

export const nameSchema = z
  .string()
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .regex(
    /^[a-zA-Z0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10}$/, "Le numéro de téléphone doit contenir 10 chiffres");

export const emailSchema = z.string().email("L'email n'est pas valide");

export const websiteSchema = z
  .string()
  .optional()
  .refine((val) => {
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
  }, "L'URL du site web n'est pas valide");

export const baseFormDataSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: websiteSchema,
  category: z.string().optional(),
  placeCategory: z.string().optional(),
  location: locationSchema.optional().nullable(),
  placeType: z.array(z.enum(["food", "art", "craft"])).optional(),
  placeActive: z.boolean().optional(),
  userType: z.enum(["creator", "organizer", "guest"]).optional(),
});

export const addOrganizerSchema = baseFormDataSchema.extend({
  name: nameSchema,
  placeCategory: z.string().min(1, "La catégorie du lieu est requise"),
  location: locationSchema,
  placeType: z.array(z.enum(["food", "art", "craft"])).optional(),
  defaultSchedule: defaultScheduleSchema.optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  website: websiteSchema,
  collaborators: z.array(z.string()).optional(),
  createdCollaborators: z.array(createdCollaboratorSchema).optional(),
});

export type AddOrganizerInput = z.infer<typeof addOrganizerSchema>;
