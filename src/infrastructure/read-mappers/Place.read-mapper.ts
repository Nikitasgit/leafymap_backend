import {
  PlaceDetailsReadModel,
  PlaceListItemReadModel,
} from "@src/domain/read-models/place.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the result into the typed read model expected by the API.
 */
export class PlaceReadMapper {
  static toListItem(doc: unknown): PlaceListItemReadModel {
    return normalizeLeanDocument<PlaceListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): PlaceListItemReadModel[] {
    return docs.map((doc) => PlaceReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): PlaceDetailsReadModel {
    return normalizeLeanDocument<PlaceDetailsReadModel>(doc);
  }

  static toDetails(docs: unknown[]): PlaceDetailsReadModel[] {
    return docs.map((doc) => PlaceReadMapper.toDetail(doc));
  }
}
