import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const NOTIFICATION_REFERENCE_TYPES = [
  "Place",
  "Event",
  "Partnership",
  "Conversation",
  "Message",
  "Follow",
] as const;

export type NotificationReferenceType =
  (typeof NOTIFICATION_REFERENCE_TYPES)[number];

export const NotificationReferenceType = {
  from(value: string): NotificationReferenceType {
    if (
      !NOTIFICATION_REFERENCE_TYPES.includes(
        value as NotificationReferenceType
      )
    ) {
      const message = `Invalid notification reference type: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as NotificationReferenceType;
  },
};
