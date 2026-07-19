import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const NOTIFICATION_ACTIONS = [
  "message",
  "partnership_invitation",
  "partnership_accepted",
  "event_invitation",
  "event_accepted",
  "event_refused",
  "event_booking_cancelled",
  "review",
  "new_follower",
  "other",
] as const;

export type NotificationAction = (typeof NOTIFICATION_ACTIONS)[number];

export const NotificationAction = {
  from(value: string): NotificationAction {
    if (!NOTIFICATION_ACTIONS.includes(value as NotificationAction)) {
      const message = `Invalid notification action: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as NotificationAction;
  },
};
