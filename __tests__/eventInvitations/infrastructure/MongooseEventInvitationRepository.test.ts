import mongoose from "mongoose";
import {
  clearCollection,
  connectMongo,
  disconnectMongo,
} from "../../helpers/mongoTestSetup";
import MongooseEventInvitationRepository from "@src/infrastructure/repositories/MongooseEventInvitationRepository";
import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import EventInvitationModel from "@src/infrastructure/persistence/schemas/EventInvitation.schema";

describe("MongooseEventInvitationRepository", () => {
  const repository = new MongooseEventInvitationRepository();

  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  beforeEach(async () => {
    await clearCollection(EventInvitationModel);
  });

  it("saves and finds an invitation by event and collaborator", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const initiatorId = UserId.from(new mongoose.Types.ObjectId().toString());
    const collaboratorId = UserId.from(
      new mongoose.Types.ObjectId().toString()
    );

    const id = await repository.save(
      EventInvitation.create({
        eventId,
        initiatorId,
        collaboratorId,
      })
    );

    const found = await repository.findByEventAndCollaborator(
      eventId,
      collaboratorId
    );

    expect(found?.id).toBe(id);
    expect(found?.eventId).toBe(eventId);
    expect(found?.initiatorId).toBe(initiatorId);
    expect(found?.collaboratorId).toBe(collaboratorId);
    expect(found?.status).toBe("pending");
    expect(found?.deleted).toBe(false);
  });

  it("updates an invitation to accepted", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const initiatorId = UserId.from(new mongoose.Types.ObjectId().toString());
    const collaboratorId = UserId.from(
      new mongoose.Types.ObjectId().toString()
    );

    const id = await repository.save(
      EventInvitation.create({
        eventId,
        initiatorId,
        collaboratorId,
      })
    );

    const invitation = await repository.findById(id);
    expect(invitation).not.toBeNull();

    await repository.update(invitation!.accept());

    const updated = await repository.findById(id);
    expect(updated?.status).toBe("accepted");
    expect(updated?.deleted).toBe(false);
  });

  it("cancels pending invitations by event ids", async () => {
    const eventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const otherEventId = EventId.from(new mongoose.Types.ObjectId().toString());
    const initiatorId = UserId.from(new mongoose.Types.ObjectId().toString());
    const collaboratorA = UserId.from(new mongoose.Types.ObjectId().toString());
    const collaboratorB = UserId.from(new mongoose.Types.ObjectId().toString());
    const collaboratorC = UserId.from(new mongoose.Types.ObjectId().toString());

    const pendingId = await repository.save(
      EventInvitation.create({
        eventId,
        initiatorId,
        collaboratorId: collaboratorA,
      })
    );
    const acceptedId = await repository.save(
      EventInvitation.create({
        eventId,
        initiatorId,
        collaboratorId: collaboratorB,
      })
    );
    const otherEventPendingId = await repository.save(
      EventInvitation.create({
        eventId: otherEventId,
        initiatorId,
        collaboratorId: collaboratorC,
      })
    );

    const accepted = await repository.findById(acceptedId);
    await repository.update(accepted!.accept());

    const modified = await repository.cancelPendingByEventIds([eventId]);
    expect(modified).toBe(1);

    const cancelled = await repository.findById(pendingId);
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.deleted).toBe(true);

    const stillAccepted = await repository.findById(acceptedId);
    expect(stillAccepted?.status).toBe("accepted");
    expect(stillAccepted?.deleted).toBe(false);

    const otherPending = await repository.findById(otherEventPendingId);
    expect(otherPending?.status).toBe("pending");
    expect(otherPending?.deleted).toBe(false);
  });
});
