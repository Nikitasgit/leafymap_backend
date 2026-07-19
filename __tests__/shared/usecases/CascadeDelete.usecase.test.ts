import { Types } from "mongoose";
import CascadeDeleteUseCase from "@src/application/usecases/shared/CascadeDelete.usecase";
import DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import { EventId, PlaceId } from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CascadeDeleteUseCase", () => {
  const eventRepository = {
    findIdsByPlace: jest.fn(),
    deleteManyByIds: jest.fn(),
  };
  const placeRepository = {
    deleteOne: jest.fn(),
  };
  const reviewRepository = {
    findIdsByReferences: jest.fn().mockResolvedValue([]),
    deleteManyByReferences: jest.fn(),
  };
  const commentRepository = {
    findIdsByReferences: jest.fn().mockResolvedValue([]),
    deleteManyByIds: jest.fn(),
  };
  const favoriteRepository = {
    deleteAllByReference: jest.fn(),
  };
  const eventBookingRepository = {
    deleteManyByEventIds: jest.fn(),
  };
  const eventInvitationRepository = {
    deleteManyByEventIds: jest.fn(),
  };
  const notificationRepository = {
    deleteByReferences: jest.fn(),
  };
  const imageRepository = {
    findIdsByReferences: jest.fn().mockResolvedValue([]),
  };
  const deleteImagesUseCase = {
    execute: jest.fn(),
  };

  let useCase: CascadeDeleteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CascadeDeleteUseCase(
      eventRepository as never,
      placeRepository as never,
      reviewRepository as never,
      commentRepository as never,
      favoriteRepository as never,
      eventBookingRepository as never,
      eventInvitationRepository as never,
      notificationRepository as never,
      imageRepository as never,
      deleteImagesUseCase as unknown as DeleteImagesUseCase
    );
  });

  it("no-ops when deleteEvents receives an empty list", async () => {
    await useCase.deleteEvents([]);

    expect(eventRepository.deleteManyByIds).not.toHaveBeenCalled();
  });

  it("deletes event dependents then the events", async () => {
    const eventId = mockObjectId();

    await useCase.deleteEvents([eventId]);

    expect(eventBookingRepository.deleteManyByEventIds).toHaveBeenCalledWith([
      EventId.from(eventId),
    ]);
    expect(eventInvitationRepository.deleteManyByEventIds).toHaveBeenCalledWith(
      [EventId.from(eventId)]
    );
    expect(notificationRepository.deleteByReferences).toHaveBeenCalled();
    expect(eventRepository.deleteManyByIds).toHaveBeenCalledWith([
      EventId.from(eventId),
    ]);
  });

  it("deletes place events then the place", async () => {
    const placeId = mockObjectId();
    const eventId = EventId.from(mockObjectId());
    eventRepository.findIdsByPlace.mockResolvedValue([eventId]);

    await useCase.deletePlace(placeId);

    expect(eventRepository.findIdsByPlace).toHaveBeenCalledWith(
      PlaceId.from(placeId)
    );
    expect(eventRepository.deleteManyByIds).toHaveBeenCalledWith([eventId]);
    expect(favoriteRepository.deleteAllByReference).toHaveBeenCalled();
    expect(placeRepository.deleteOne).toHaveBeenCalledWith(
      PlaceId.from(placeId)
    );
  });
});
