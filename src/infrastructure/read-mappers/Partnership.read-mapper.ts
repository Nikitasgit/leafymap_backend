import { PartnershipListItemReadModel } from "@src/domain/read-models/partnership.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class PartnershipReadMapper {
  static toListItem(doc: unknown): PartnershipListItemReadModel {
    const partnership =
      normalizeLeanDocument<PartnershipListItemReadModel>(doc);
    return {
      id: partnership.id,
      initiator: partnership.initiator,
      collaborator: partnership.collaborator,
      status: partnership.status,
      deleted: partnership.deleted,
      updatedAt: partnership.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): PartnershipListItemReadModel[] {
    return docs.map((doc) => PartnershipReadMapper.toListItem(doc));
  }
}
