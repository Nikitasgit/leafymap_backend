import { EventBooking } from "@src/domain/entities/EventBooking.entity";
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
  ): Promise<EventBooking | null>;

  sumConfirmedSeats(
    eventId: EventId,
    excludeBookingId?: EventBookingId
  ): Promise<number>;

  findConfirmedByEvent(
    eventId: EventId
  ): Promise<Record<string, unknown>[]>;
  findConfirmedByUser(userId: UserId): Promise<Record<string, unknown>[]>;
}
