export const EVENT_STATUSES = ["cancelled", "full", "available"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EventStatus = {
  from(value: string): EventStatus {
    if (!EVENT_STATUSES.includes(value as EventStatus)) {
      throw new Error(`Invalid event status: ${value}`);
    }
    return value as EventStatus;
  },
};
