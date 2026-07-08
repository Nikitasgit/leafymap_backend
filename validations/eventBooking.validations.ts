import { z } from "zod";

export const createEventBookingSchema = z.object({
  seats: z
    .number()
    .int("Le nombre de places doit être un nombre entier")
    .min(1, "Le nombre de places doit être supérieur à 0"),
});

export const updateEventBookingSchema = z.object({
  seats: z
    .number()
    .int("Le nombre de places doit être un nombre entier")
    .min(1, "Le nombre de places doit être supérieur à 0"),
});
