import { EventInvitationListItemReadModel } from "@src/domain/read-models/eventInvitation.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class EventInvitationReadMapper {
  static toListItem(doc: unknown): EventInvitationListItemReadModel {
    const invitation =
      normalizeLeanDocument<EventInvitationListItemReadModel>(doc);
    return {
      id: invitation.id,
      initiator: invitation.initiator,
      collaborator: invitation.collaborator,
      event: invitation.event,
      status: invitation.status,
      deleted: invitation.deleted,
      updatedAt: invitation.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): EventInvitationListItemReadModel[] {
    return docs.map((doc) => EventInvitationReadMapper.toListItem(doc));
  }
}
