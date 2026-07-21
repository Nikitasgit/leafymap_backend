import {
  EventBookingListItemReadModel,
  MyEventBookingReadModel,
} from "@src/domain/read-models/eventBooking.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class EventBookingReadMapper {
  static toListItem(doc: unknown): EventBookingListItemReadModel {
    const booking =
      normalizeLeanDocument<EventBookingListItemReadModel>(doc);
    return {
      id: booking.id,
      event: booking.event,
      user: booking.user,
      seats: booking.seats,
      status: booking.status,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): EventBookingListItemReadModel[] {
    return docs.map((doc) => EventBookingReadMapper.toListItem(doc));
  }

  static toMyEventBooking(doc: unknown): MyEventBookingReadModel {
    const booking = normalizeLeanDocument<MyEventBookingReadModel>(doc);
    return {
      id: booking.id,
      event: booking.event,
      user: booking.user,
      seats: booking.seats,
      status: booking.status,
      cancelledAt: booking.cancelledAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
