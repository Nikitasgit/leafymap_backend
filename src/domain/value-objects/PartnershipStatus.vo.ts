import { ERROR_CODES, ValidationError } from "@src/shared/errors";

export const PARTNERSHIP_STATUSES = [
  "pending",
  "accepted",
  "refused",
  "cancelled",
  "completed",
] as const;

export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number];

export const PartnershipStatus = {
  from(value: string): PartnershipStatus {
    if (!PARTNERSHIP_STATUSES.includes(value as PartnershipStatus)) {
      const message = `Invalid partnership status: ${value}`;
      throw new ValidationError(
        { value: message },
        ERROR_CODES.VALIDATION_ERROR,
        message
      );
    }
    return value as PartnershipStatus;
  },
};
