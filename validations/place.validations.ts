import { z } from "zod";

export const placeCategorySchema = z
  .string()
  .min(1, "La catégorie du lieu est requise");

export const locationSchema = z.object({
  id: z.string(),
  label: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  type: z.literal("Point"),
});

const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const timeString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format d'heure invalide (HH:mm)");

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const placeTimeSlotSchema = z
  .object({
    startTime: timeString,
    endTime: timeString,
  })
  .refine((slot) => toMinutes(slot.startTime) < toMinutes(slot.endTime), {
    message: "L'heure de début doit précéder l'heure de fin",
  });

const timeSlotsSchema = z
  .array(placeTimeSlotSchema)
  .refine(
    (slots) => {
      const sorted = [...slots].sort(
        (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
      );
      return sorted.every(
        (slot, i) =>
          i === 0 || toMinutes(sorted[i - 1].endTime) <= toMinutes(slot.startTime)
      );
    },
    { message: "Les créneaux horaires ne doivent pas se chevaucher" }
  );

export const dayScheduleSchema = z.object({
  open: z.boolean(),
  timeSlots: timeSlotsSchema,
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

export const customDateSchema = z.object({
  date: z.coerce.date(),
  open: z.boolean(),
  timeSlots: timeSlotsSchema,
});

export const newPlaceSchema = z.object({
  placeCategory: placeCategorySchema,
  location: locationSchema,
  defaultSchedule: defaultScheduleSchema.optional(),
  customDates: z.array(customDateSchema).optional(),
});

export const updatePlaceSchema = newPlaceSchema.partial();

export const getPlacesQuerySchema = z.object({
  categoryId: z.string().optional(),
  limit: z.coerce.number().optional(),
});

export const getPlaceByIdQuerySchema = z.object({
  scheduleWithEvents: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export { weekDays };
