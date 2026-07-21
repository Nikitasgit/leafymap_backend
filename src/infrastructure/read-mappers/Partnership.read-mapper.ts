import { PartnershipListItemReadModel } from "@src/domain/read-models/partnership.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string
 * (including on populated initiator/collaborator subdocuments).
 */
export class PartnershipReadMapper {
  static toListItem(doc: unknown): PartnershipListItemReadModel {
    return normalizeLeanDocument<PartnershipListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): PartnershipListItemReadModel[] {
    return docs.map((doc) => PartnershipReadMapper.toListItem(doc));
  }
}
