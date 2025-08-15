// Collaborator request types
export interface InviteCollaboratorRequest {
  userId: string;
  placeId?: string;
  eventId?: string;
  role?: string;
  permissions?: string[];
  message?: string;
}

export interface UpdateCollaboratorRequest {
  status?: "pending" | "accepted" | "refused";
  role?: string;
  permissions?: string[];
}

export interface RespondToInvitationRequest {
  status: "accepted" | "refused";
  message?: string;
}

export interface RemoveCollaboratorRequest {
  collaboratorId: string;
  reason?: string;
}

export interface GetCollaboratorsQuery {
  placeId?: string;
  eventId?: string;
  status?: "pending" | "accepted" | "refused";
  role?: string;
}
