import mongoose from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseEventBookingRepository from "@src/infrastructure/repositories/MongooseEventBookingRepository";
import { EventBooking } from "@src/domain/entities/EventBooking.entity";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import EventBookingModel from "@src/infrastructure/persistence/schemas/EventBooking.schema";

describe("MongooseEventBookingRepository", () => {
  const repository = new MongooseEventBookingRepository();

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  beforeEach(async () => {
    await clearCollection(EventBookingModel);
  });

  it("saves and finds a confirmed booking by event and user", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const userId = UserId.from(new mongoose.Types.ObjectId().toString());

    const id = await repository.save(
      EventBooking.create({
        eventId,
        userId,
        seats: 2,
      })
    );

    const found = await repository.findConfirmedByEventAndUser(eventId, userId);

    expect(found?.id).toBe(id);
    expect(found?.eventId).toBe(eventId);
    expect(found?.userId).toBe(userId);
    expect(found?.seats).toBe(2);
    expect(found?.status).toBe("confirmed");
  });

  it("updates a booking to cancelled so it is no longer confirmed", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const userId = UserId.from(new mongoose.Types.ObjectId().toString());

    const id = await repository.save(
      EventBooking.create({
        eventId,
        userId,
        seats: 1,
      })
    );

    const booking = await repository.findById(id);
    expect(booking).not.toBeNull();

    await repository.update(booking!.cancel());

    const confirmed = await repository.findConfirmedByEventAndUser(
      eventId,
      userId
    );
    expect(confirmed).toBeNull();

    const cancelled = await repository.findById(id);
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.cancelledAt).toBeInstanceOf(Date);
  });

  it("sums confirmed seats for an event", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const otherEventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const userA = UserId.from(new mongoose.Types.ObjectId().toString());
    const userB = UserId.from(new mongoose.Types.ObjectId().toString());
    const userC = UserId.from(new mongoose.Types.ObjectId().toString());

    const bookingAId = await repository.save(
      EventBooking.create({ eventId, userId: userA, seats: 2 })
    );
    await repository.save(
      EventBooking.create({ eventId, userId: userB, seats: 3 })
    );
    await repository.save(
      EventBooking.create({
        eventId: otherEventId,
        userId: userC,
        seats: 10,
      })
    );

    expect(await repository.sumConfirmedSeats(eventId)).toBe(5);
    expect(await repository.sumConfirmedSeats(eventId, bookingAId)).toBe(3);

    const bookingA = await repository.findById(bookingAId);
    await repository.update(bookingA!.cancel());

    expect(await repository.sumConfirmedSeats(eventId)).toBe(3);
  });
});
