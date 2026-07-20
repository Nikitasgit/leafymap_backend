import { EventBookingListItemReadModel } from "@src/domain/read-models/eventBooking.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string
 * (including on populated event/user subdocuments).
 */
export class EventBookingReadMapper {
  static toListItem(doc: unknown): EventBookingListItemReadModel {
    return normalizeLeanDocument<EventBookingListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): EventBookingListItemReadModel[] {
    return docs.map((doc) => EventBookingReadMapper.toListItem(doc));
  }
}
