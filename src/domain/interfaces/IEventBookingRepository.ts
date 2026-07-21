import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import {
  EventBookingListItemReadModel,
  MyEventBookingReadModel,
} from "@src/domain/read-models/eventBooking.read-models";
import {
  EventBookingId,
  EventId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface IEventBookingRepository {
  save(booking: EventBooking): Promise<EventBookingId>;
  findById(id: EventBookingId): Promise<EventBooking | null>;
  update(booking: EventBooking): Promise<void>;
  deleteManyByEventIds(eventIds: EventId[]): Promise<void>;
  deleteManyByUserId(userId: UserId): Promise<void>;

  findConfirmedByEventAndUser(
    eventId: EventId,
    userId: UserId
  ): Promise<MyEventBookingReadModel | null>;

  sumConfirmedSeats(
    eventId: EventId,
    excludeBookingId?: EventBookingId
  ): Promise<number>;

  findConfirmedByEvent(
    eventId: EventId
  ): Promise<EventBookingListItemReadModel[]>;
  findConfirmedByUser(
    userId: UserId
  ): Promise<EventBookingListItemReadModel[]>;
}
