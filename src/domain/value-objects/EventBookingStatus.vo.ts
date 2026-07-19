import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const EVENT_BOOKING_STATUSES = ["confirmed", "cancelled"] as const;

export type EventBookingStatus = (typeof EVENT_BOOKING_STATUSES)[number];

export const EventBookingStatus = {
  from(value: string): EventBookingStatus {
    if (!EVENT_BOOKING_STATUSES.includes(value as EventBookingStatus)) {
      const message = `Invalid event booking status: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as EventBookingStatus;
  },
};
