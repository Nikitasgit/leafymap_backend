import { EventInvitationListItemReadModel } from "@src/domain/read-models/eventInvitation.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string
 * (including on populated initiator/collaborator/event subdocuments).
 */
export class EventInvitationReadMapper {
  static toListItem(doc: unknown): EventInvitationListItemReadModel {
    return normalizeLeanDocument<EventInvitationListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): EventInvitationListItemReadModel[] {
    return docs.map((doc) => EventInvitationReadMapper.toListItem(doc));
  }
}
