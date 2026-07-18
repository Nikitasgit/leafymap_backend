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
      throw new Error(`Invalid lifecycle status: ${value}`);
    }
    return value as LifecycleStatus;
  },
};
