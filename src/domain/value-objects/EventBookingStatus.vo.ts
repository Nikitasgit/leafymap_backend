export const EVENT_BOOKING_STATUSES = ["confirmed", "cancelled"] as const;

export type EventBookingStatus = (typeof EVENT_BOOKING_STATUSES)[number];

export const EventBookingStatus = {
  from(value: string): EventBookingStatus {
    if (!EVENT_BOOKING_STATUSES.includes(value as EventBookingStatus)) {
      throw new Error(`Invalid event booking status: ${value}`);
    }
    return value as EventBookingStatus;
  },
};
