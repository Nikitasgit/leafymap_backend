import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import {
  EventBookingId,
  EventId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventBookingStatus } from "@src/domain/value-objects/EventBookingStatus.vo";
import { EventBookingDocumentProps } from "@src/infrastructure/persistence/schemas/EventBooking.schema";
import { Types } from "mongoose";

export class EventBookingMapper {
  static toDomain(
    doc: EventBookingDocumentProps & { _id: Types.ObjectId }
  ): EventBooking {
    return EventBooking.reconstitute({
      id: EventBookingId.from(doc._id.toString()),
      eventId: EventId.from(doc.event.toString()),
      userId: UserId.from(doc.user.toString()),
      seats: doc.seats,
      status: EventBookingStatus.from(doc.status),
      cancelledAt: doc.cancelledAt,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    booking: EventBooking
  ): Omit<EventBookingDocumentProps, "_id"> {
    return {
      event: new Types.ObjectId(booking.eventId),
      user: new Types.ObjectId(booking.userId),
      seats: booking.seats,
      status: booking.status,
      cancelledAt: booking.cancelledAt ?? null,
    };
  }
}
