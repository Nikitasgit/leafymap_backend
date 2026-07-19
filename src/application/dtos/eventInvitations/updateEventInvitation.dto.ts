import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";

export interface UpdateEventInvitationItem {
  id: string;
  deleted?: boolean;
  status?: EventInvitationStatus;
}

export interface UpdateEventInvitationInput {
  invitations: UpdateEventInvitationItem[];
  userId: string;
}
