import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const EVENT_STATUSES = ["cancelled", "full", "available"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EventStatus = {
  from(value: string): EventStatus {
    if (!EVENT_STATUSES.includes(value as EventStatus)) {
      const message = `Invalid event status: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as EventStatus;
  },
};
