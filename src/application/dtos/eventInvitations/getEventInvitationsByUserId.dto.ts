export interface GetEventInvitationsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
  currentUserId?: string;
  onlyAccepted?: boolean;
  onlyPending?: boolean;
}
