import {
  EventBookingId,
  EventId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventBookingStatus } from "@src/domain/value-objects/EventBookingStatus.vo";
import { ValidationError } from "@src/shared/errors";

export interface CreateEventBookingParams {
  eventId: EventId;
  userId: UserId;
  seats: number;
}

export interface ReconstituteEventBookingParams {
  id: EventBookingId;
  eventId: EventId;
  userId: UserId;
  seats: number;
  status: EventBookingStatus;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class EventBooking {
  private constructor(
    public readonly id: EventBookingId | null,
    public readonly eventId: EventId,
    public readonly userId: UserId,
    public readonly seats: number,
    public readonly status: EventBookingStatus,
    public readonly cancelledAt: Date | null | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateEventBookingParams): EventBooking {
    const seats = EventBooking.assertSeats(params.seats);
    const now = new Date();
    return new EventBooking(
      null,
      params.eventId,
      params.userId,
      seats,
      "confirmed",
      null,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteEventBookingParams): EventBooking {
    return new EventBooking(
      params.id,
      params.eventId,
      params.userId,
      params.seats,
      params.status,
      params.cancelledAt,
      params.createdAt,
      params.updatedAt
    );
  }

  updateSeats(seats: number): EventBooking {
    if (this.status !== "confirmed") {
      throw new ValidationError({
        status: "Only confirmed bookings can be updated",
      });
    }
    return new EventBooking(
      this.id,
      this.eventId,
      this.userId,
      EventBooking.assertSeats(seats),
      this.status,
      this.cancelledAt,
      this.createdAt,
      new Date()
    );
  }

  cancel(): EventBooking {
    if (this.status === "cancelled") {
      return this;
    }
    return new EventBooking(
      this.id,
      this.eventId,
      this.userId,
      this.seats,
      "cancelled",
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.userId === userId;
  }

  private static assertSeats(seats: number): number {
    if (!Number.isInteger(seats) || seats < 1) {
      throw new ValidationError({
        seats: "Seats must be an integer greater than or equal to 1",
      });
    }
    return seats;
  }
}
