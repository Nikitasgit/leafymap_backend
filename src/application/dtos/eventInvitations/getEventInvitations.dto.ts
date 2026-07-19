export interface GetEventInvitationsInput {
  eventId: string;
  currentUserId?: string;
  onlyAccepted?: boolean;
}
