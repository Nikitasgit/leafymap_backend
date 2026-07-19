import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const EVENT_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "refused",
  "cancelled",
  "completed",
] as const;

export type EventInvitationStatus =
  (typeof EVENT_INVITATION_STATUSES)[number];

export const EventInvitationStatus = {
  from(value: string): EventInvitationStatus {
    if (!EVENT_INVITATION_STATUSES.includes(value as EventInvitationStatus)) {
      const message = `Invalid event invitation status: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as EventInvitationStatus;
  },
};
