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
      throw new Error(`Invalid partnership status: ${value}`);
    }
    return value as PartnershipStatus;
  },
};
