import { z } from "zod";
import { descriptionSchema } from "./common.validations";
import { locationSchema } from "./place.validations";

export const eventNameSchema = z
  .string()
  .min(1, "Le nom est requis")
  .min(4, "Le nom doit contenir au moins 4 caractères")
  .max(40, "Le nom ne peut pas dépasser 40 caractères")
  .regex(
    /^[a-zA-ZÀ-ÿ0-9\s']+$/,
    "Le nom ne peut contenir que des lettres, chiffres, espaces et le caractère '"
  );

const eventLocationFieldsSchema = z.object({
  place: z.string().optional().nullable(),
  location: locationSchema.optional().nullable(),
  online: z.boolean().optional().default(false),
});

const eventBaseSchema = z.object({
  name: eventNameSchema,
  description: descriptionSchema,
  eventCategory: z.string().min(1, "La catégorie est requise"),
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

const validateEventLocationMode = (
  data: {
    place?: string | null;
    location?: z.infer<typeof locationSchema> | null;
    online?: boolean;
  },
  ctx: z.RefinementCtx
) => {
  if (data.online) return;

  if (!data.place && !data.location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["location"],
      message: "Un lieu ou une adresse est requis pour un évènement présentiel",
    });
  }
};

export const newEventSchema = eventBaseSchema
  .merge(eventLocationFieldsSchema)
  .superRefine(validateEventLocationMode);

export const updateEventSchema = eventBaseSchema
  .merge(eventLocationFieldsSchema)
  .partial()
  .superRefine((data, ctx) => {
    const hasLocationUpdate =
      "online" in data || "place" in data || "location" in data;

    if (hasLocationUpdate) {
      validateEventLocationMode(data, ctx);
    }
  });
