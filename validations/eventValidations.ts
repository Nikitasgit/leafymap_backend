import { z } from "zod";
import { descriptionSchema, ValidationResult } from "./commonValidations";
import { IEvent } from "types/models/event";

export const eventNameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(40, "Le nom ne peut pas dépasser 40 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

const newEventSchema = z.object({
  name: eventNameSchema,
  description: descriptionSchema,
  image: z.string().optional(),
  schedule: z
    .array(
      z.object({
        startDate: z.string().transform((val) => new Date(val)),
        endDate: z.string().transform((val) => new Date(val)),
        timeSlots: z
          .array(
            z.object({
              startTime: z.string(),
              endTime: z.string(),
              title: z.string(),
              collaborators: z.array(
                z.object({
                  _id: z.string(),
                  name: z.string().optional(),
                  image: z.string().optional(),
                })
              ),
            })
          )
          .optional(),
      })
    )
    .min(1, "Le programme doit contenir au moins une date"),
});

const updateEventSchema = newEventSchema.partial();

export const validateEventData = (
  data: Partial<IEvent>,
  isUpdate: boolean = false
): ValidationResult => {
  const errors: Record<string, string> = {};

  let eventSchema;
  if (isUpdate) {
    eventSchema = updateEventSchema;
  } else {
    eventSchema = newEventSchema;
  }
  const result = eventSchema.safeParse(data);

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
