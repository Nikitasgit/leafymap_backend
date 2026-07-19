import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const LIFECYCLE_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "unvalid",
] as const;

export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number];

export const LifecycleStatus = {
  from(value: string): LifecycleStatus {
    if (!LIFECYCLE_STATUSES.includes(value as LifecycleStatus)) {
      const message = `Invalid lifecycle status: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as LifecycleStatus;
  },
};
