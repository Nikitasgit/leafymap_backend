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
      throw new Error(`Invalid event invitation status: ${value}`);
    }
    return value as EventInvitationStatus;
  },
};
