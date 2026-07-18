import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface EventInvitationUserListFilters {
  userId: UserId;
  asCollaborator?: boolean;
  onlyAccepted?: boolean;
  onlyPending?: boolean;
  currentUserId?: UserId;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
}

export interface IEventInvitationRepository {
  save(invitation: EventInvitation): Promise<EventInvitationId>;
  findById(id: EventInvitationId): Promise<EventInvitation | null>;
  update(invitation: EventInvitation): Promise<void>;
  delete(id: EventInvitationId): Promise<void>;

  findByEventAndCollaborator(
    eventId: EventId,
    collaboratorId: UserId
  ): Promise<EventInvitation | null>;

  findListByEvent(eventId: EventId): Promise<Record<string, unknown>[]>;
  findListForUser(
    filters: EventInvitationUserListFilters
  ): Promise<Record<string, unknown>[]>;

  deleteManyByEventIds(eventIds: EventId[]): Promise<void>;
  deleteManyByUserId(userId: UserId): Promise<void>;

  cancelPendingByEventIds(eventIds: EventId[]): Promise<number>;
}
