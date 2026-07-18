import { IEventBookingRepository } from "@src/domain/interfaces/IEventBookingRepository";
import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import {
  EventBookingId,
  EventId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventBookingMapper } from "@src/infrastructure/mappers/EventBooking.mapper";
import EventBookingModel, {
  EventBookingDocumentProps,
} from "@src/infrastructure/persistence/schemas/EventBooking.schema";
import { Types } from "mongoose";

type EventBookingDocumentWithId = EventBookingDocumentProps & {
  _id: Types.ObjectId;
};

class MongooseEventBookingRepository implements IEventBookingRepository {
  async save(booking: EventBooking): Promise<EventBookingId> {
    const document = await EventBookingModel.create(
      EventBookingMapper.toPersistence(booking)
    );
    return EventBookingId.from(document._id.toString());
  }

  async findById(id: EventBookingId): Promise<EventBooking | null> {
    const document = await EventBookingModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return EventBookingMapper.toDomain(document as EventBookingDocumentWithId);
  }

  async update(booking: EventBooking): Promise<void> {
    if (!booking.id) {
      return;
    }
    await EventBookingModel.updateOne(
      { _id: booking.id },
      {
        seats: booking.seats,
        status: booking.status,
        cancelledAt: booking.cancelledAt ?? null,
        updatedAt: booking.updatedAt,
      }
    ).exec();
  }

  async deleteManyByEventIds(eventIds: EventId[]): Promise<void> {
    if (eventIds.length === 0) return;
    await EventBookingModel.deleteMany({
      event: { $in: eventIds.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async deleteManyByUserId(userId: UserId): Promise<void> {
    await EventBookingModel.deleteMany({
      user: new Types.ObjectId(userId),
    }).exec();
  }

  async findConfirmedByEventAndUser(
    eventId: EventId,
    userId: UserId
  ): Promise<EventBooking | null> {
    const document = await EventBookingModel.findOne({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(userId),
      status: "confirmed",
    }).lean();

    if (!document) {
      return null;
    }
    return EventBookingMapper.toDomain(document as EventBookingDocumentWithId);
  }

  async sumConfirmedSeats(
    eventId: EventId,
    excludeBookingId?: EventBookingId
  ): Promise<number> {
    const match: Record<string, unknown> = {
      event: new Types.ObjectId(eventId),
      status: "confirmed",
    };
    if (excludeBookingId) {
      match._id = { $ne: new Types.ObjectId(excludeBookingId) };
    }

    const result = await EventBookingModel.aggregate<{ total: number }>([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$seats" } } },
    ]);

    return result[0]?.total ?? 0;
  }

  async findConfirmedByEvent(
    eventId: EventId
  ): Promise<Record<string, unknown>[]> {
    const bookings = await EventBookingModel.find({
      event: new Types.ObjectId(eventId),
      status: "confirmed",
    })
      .populate({
        path: "user",
        select: "username email image",
        populate: { path: "image", select: "urls" },
      })
      .lean();

    return bookings as unknown as Record<string, unknown>[];
  }

  async findConfirmedByUser(
    userId: UserId
  ): Promise<Record<string, unknown>[]> {
    const bookings = await EventBookingModel.find({
      user: new Types.ObjectId(userId),
      status: "confirmed",
    })
      .populate({
        path: "event",
        populate: [
          { path: "image", select: "urls" },
          { path: "place", select: "location" },
          { path: "user", select: "username image", populate: { path: "image", select: "urls" } },
          { path: "eventCategory", select: "name" },
        ],
      })
      .lean();

    return bookings as unknown as Record<string, unknown>[];
  }
}

export default MongooseEventBookingRepository;
