import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventInvitationStatus } from "@src/domain/value-objects/EventInvitationStatus.vo";
import { EventInvitationDocumentProps } from "@src/infrastructure/persistence/schemas/EventInvitation.schema";
import { Types } from "mongoose";

export class EventInvitationMapper {
  static toDomain(
    doc: EventInvitationDocumentProps & { _id: Types.ObjectId }
  ): EventInvitation {
    return EventInvitation.reconstitute({
      id: EventInvitationId.from(doc._id.toString()),
      eventId: EventId.from(doc.event.toString()),
      initiatorId: UserId.from(doc.initiator.toString()),
      collaboratorId: UserId.from(doc.collaborator.toString()),
      status: EventInvitationStatus.from(doc.status),
      deleted: doc.deleted ?? false,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    invitation: EventInvitation
  ): Omit<EventInvitationDocumentProps, "_id"> {
    return {
      event: new Types.ObjectId(invitation.eventId),
      initiator: new Types.ObjectId(invitation.initiatorId),
      collaborator: new Types.ObjectId(invitation.collaboratorId),
      status: invitation.status,
      deleted: invitation.deleted,
    };
  }
}
