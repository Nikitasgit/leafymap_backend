export interface CreateEventInvitationItem {
  collaboratorId: string;
}

export interface CreateEventInvitationsInput {
  eventId: string;
  initiatorId: string;
  invitations: CreateEventInvitationItem[];
}
