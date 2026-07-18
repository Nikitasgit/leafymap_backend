import { Types } from "mongoose";
import CreateEventInvitationsUseCase from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventInvitationNotifier } from "@src/domain/interfaces/IEventInvitationNotifier";
import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  EventCategoryId,
  EventId,
  EventInvitationId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

const createEvent = (ownerId: string): Event => {
  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 10);
  const futureEnd = new Date();
  futureEnd.setDate(futureEnd.getDate() + 11);

  return Event.reconstitute({
    id: EventId.from(mockObjectId()),
    name: "Collab event",
    description: "Test",
    ownerId: UserId.from(ownerId),
    categoryId: EventCategoryId.from(mockObjectId()),
    schedule: [{ startDate: futureStart, endDate: futureEnd }],
    dateRange: { firstDate: futureStart, latestDate: futureEnd },
    status: "available",
    lifecycleStatus: "upcoming",
    placeId: PlaceId.from(mockObjectId()),
    location: null,
    online: false,
    rating: 0,
    isBookable: false,
    capacity: null,
    maxSeatsPerBooking: 1,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("CreateEventInvitationsUseCase", () => {
  let eventInvitationRepository: jest.Mocked<IEventInvitationRepository>;
  let eventRepository: jest.Mocked<IEventRepository>;
  let eventInvitationNotifier: jest.Mocked<IEventInvitationNotifier>;
  let useCase: CreateEventInvitationsUseCase;

  beforeEach(() => {
    eventInvitationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByEventAndCollaborator: jest.fn(),
      findListByEvent: jest.fn(),
      findListForUser: jest.fn(),
      deleteManyByEventIds: jest.fn(),
      deleteManyByUserId: jest.fn(),
      cancelPendingByEventIds: jest.fn(),
    };
    eventRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IEventRepository>;
    eventInvitationNotifier = {
      notifyInvitation: jest.fn(),
      notifyAccepted: jest.fn(),
      notifyRefused: jest.fn(),
    };
    useCase = new CreateEventInvitationsUseCase(
      eventInvitationRepository,
      eventRepository,
      eventInvitationNotifier
    );
  });

  it("creates invitations for the event owner and notifies collaborators", async () => {
    const ownerId = mockObjectId();
    const collaboratorId = mockObjectId();
    const event = createEvent(ownerId);

    eventRepository.findById.mockResolvedValue(event);
    eventInvitationRepository.findByEventAndCollaborator.mockResolvedValue(
      null
    );
    eventInvitationRepository.save.mockResolvedValue(
      EventInvitationId.from(mockObjectId())
    );

    await useCase.execute({
      eventId: event.id!.toString(),
      initiatorId: ownerId,
      invitations: [{ collaboratorId }],
    });

    expect(eventInvitationRepository.save).toHaveBeenCalled();
    expect(eventInvitationNotifier.notifyInvitation).toHaveBeenCalledWith({
      senderId: UserId.from(ownerId),
      receiverId: UserId.from(collaboratorId),
      eventId: event.id,
    });
  });

  it("skips existing invitations", async () => {
    const ownerId = mockObjectId();
    const collaboratorId = mockObjectId();
    const event = createEvent(ownerId);

    eventRepository.findById.mockResolvedValue(event);
    eventInvitationRepository.findByEventAndCollaborator.mockResolvedValue(
      {} as never
    );

    await useCase.execute({
      eventId: event.id!.toString(),
      initiatorId: ownerId,
      invitations: [{ collaboratorId }],
    });

    expect(eventInvitationRepository.save).not.toHaveBeenCalled();
    expect(eventInvitationNotifier.notifyInvitation).not.toHaveBeenCalled();
  });

  it("rejects when requester is not the event owner", async () => {
    const ownerId = mockObjectId();
    const event = createEvent(ownerId);
    eventRepository.findById.mockResolvedValue(event);

    await expect(
      useCase.execute({
        eventId: event.id!.toString(),
        initiatorId: mockObjectId(),
        invitations: [{ collaboratorId: mockObjectId() }],
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FORBIDDEN,
      statusCode: 403,
    });
  });
});
