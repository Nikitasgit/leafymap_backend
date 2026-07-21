import { z } from "zod";
import { objectIdString } from "@src/api/dto/common.dto";
import {
  GetPlacesInViewInput,
  MAX_PLACE_IDS,
} from "@src/application/dtos/places/getPlacesInView.dto";

export const placeCategorySchema = objectIdString;

export const locationSchema = z.object({
  id: z.string(),
  label: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  type: z.literal("Point"),
});

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

const timeSlotsSchema = z.array(placeTimeSlotSchema).refine(
  (slots) => {
    const sorted = [...slots].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );
    return sorted.every(
      (slot, i) =>
        i === 0 ||
        toMinutes(sorted[i - 1].endTime) <= toMinutes(slot.startTime)
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

const placeIdsCsvSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value?.trim()) {
      return undefined;
    }
    return value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  });

const placesInViewLimitSchema = z
  .string()
  .optional()
  .transform((value) => (value ? parseInt(value, 10) : undefined));

const coordinateArraySchema = z.array(z.number());

const parseCoordinateArray = (value: string): number[] | undefined => {
  try {
    const parsed = coordinateArraySchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
};

export const getPlacesInViewQuerySchema = z
  .object({
    ne: z.string().optional(),
    sw: z.string().optional(),
    ids: placeIdsCsvSchema,
    filters: z.string().optional(),
    limit: placesInViewLimitSchema,
  })
  .transform((query, ctx): GetPlacesInViewInput => {
    if (query.ids && query.ids.length > MAX_PLACE_IDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ids"],
        message: `Too many ids (max ${MAX_PLACE_IDS})`,
      });
      return z.NEVER;
    }

    const result: GetPlacesInViewInput = {
      ids: query.ids,
      clientFilters: query.filters,
      limit: query.limit,
    };

    if (query.ids?.length) {
      return result;
    }

    if (!query.ne || !query.sw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coordinates"],
        message: "Missing required coordinates",
      });
      return z.NEVER;
    }

    const ne = parseCoordinateArray(query.ne);
    const sw = parseCoordinateArray(query.sw);
    if (!ne || !sw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coordinates"],
        message: "Invalid coordinate format",
      });
      return z.NEVER;
    }

    result.ne = ne;
    result.sw = sw;
    return result;
  });
