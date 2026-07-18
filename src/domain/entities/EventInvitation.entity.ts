import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";
import { ValidationError } from "@src/shared/errors";

export interface CreateEventInvitationParams {
  eventId: EventId;
  initiatorId: UserId;
  collaboratorId: UserId;
}

export interface ReconstituteEventInvitationParams {
  id: EventInvitationId;
  eventId: EventId;
  initiatorId: UserId;
  collaboratorId: UserId;
  status: EventInvitationStatus;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EventInvitation {
  private constructor(
    public readonly id: EventInvitationId | null,
    public readonly eventId: EventId,
    public readonly initiatorId: UserId,
    public readonly collaboratorId: UserId,
    public readonly status: EventInvitationStatus,
    public readonly deleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateEventInvitationParams): EventInvitation {
    if (params.initiatorId === params.collaboratorId) {
      throw new ValidationError({
        collaborator: "Cannot invite yourself",
      });
    }

    const now = new Date();
    return new EventInvitation(
      null,
      params.eventId,
      params.initiatorId,
      params.collaboratorId,
      "pending",
      false,
      now,
      now
    );
  }

  static reconstitute(
    params: ReconstituteEventInvitationParams
  ): EventInvitation {
    return new EventInvitation(
      params.id,
      params.eventId,
      params.initiatorId,
      params.collaboratorId,
      params.status,
      params.deleted,
      params.createdAt,
      params.updatedAt
    );
  }

  accept(): EventInvitation {
    if (this.status !== "pending") {
      throw new ValidationError({
        status: "Only pending invitations can be accepted",
      });
    }
    return this.withStatus("accepted");
  }

  refuse(): EventInvitation {
    if (this.status !== "pending") {
      throw new ValidationError({
        status: "Only pending invitations can be refused",
      });
    }
    return this.withStatus("refused");
  }

  cancel(): EventInvitation {
    if (this.status === "cancelled") {
      return this;
    }
    return new EventInvitation(
      this.id,
      this.eventId,
      this.initiatorId,
      this.collaboratorId,
      "cancelled",
      true,
      this.createdAt,
      new Date()
    );
  }

  restore(): EventInvitation {
    return new EventInvitation(
      this.id,
      this.eventId,
      this.initiatorId,
      this.collaboratorId,
      this.status,
      false,
      this.createdAt,
      new Date()
    );
  }

  isInitiator(userId: UserId): boolean {
    return this.initiatorId === userId;
  }

  isCollaborator(userId: UserId): boolean {
    return this.collaboratorId === userId;
  }

  isParticipant(userId: UserId): boolean {
    return this.isInitiator(userId) || this.isCollaborator(userId);
  }

  private withStatus(status: EventInvitationStatus): EventInvitation {
    return new EventInvitation(
      this.id,
      this.eventId,
      this.initiatorId,
      this.collaboratorId,
      status,
      this.deleted,
      this.createdAt,
      new Date()
    );
  }
}
