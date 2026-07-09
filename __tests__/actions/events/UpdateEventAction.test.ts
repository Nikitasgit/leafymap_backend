import { Types } from "mongoose";
import UpdateEventAction from "@/actions/events/UpdateEvent.action";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildEvent,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

describe("UpdateEventAction", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let action: UpdateEventAction;

  beforeEach(() => {
    eventRepository = createMockRepository<IEventRepository>();
    placeRepository = createMockRepository<IPlaceRepository>();
    action = new UpdateEventAction(eventRepository, placeRepository);
  });

  it("updates an event without a place", async () => {
    const eventId = mockObjectId();
    const userId = mockObjectId();

    eventRepository.findById.mockResolvedValue(buildEvent() as never);

    await action.execute({
      eventId,
      userId,
      updateData: { name: "Updated name" },
    });

    expect(eventRepository.updateOne).toHaveBeenCalledWith(eventId, {
      name: "Updated name",
      place: undefined,
      location: undefined,
    });
  });

  it("rejects when the event does not exist", async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({
        eventId: mockObjectId(),
        userId: mockObjectId(),
        updateData: { name: "Updated name" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_NOT_FOUND,
      statusCode: 404,
    });

    expect(eventRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when the place does not exist", async () => {
    const eventId = mockObjectId();
    const placeId = mockObjectId();

    eventRepository.findById.mockResolvedValue(buildEvent() as never);
    placeRepository.findById.mockResolvedValue(null);

    await expect(
      action.execute({
        eventId,
        userId: mockObjectId(),
        updateData: { place: placeId },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.PLACE_NOT_FOUND,
      statusCode: 404,
    });

    expect(eventRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects when the user does not own the place", async () => {
    const eventId = mockObjectId();
    const placeId = mockObjectId();
    const ownerId = mockObjectId();
    const otherUserId = mockObjectId();

    eventRepository.findById.mockResolvedValue(buildEvent() as never);
    placeRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(placeId),
      user: new Types.ObjectId(ownerId),
    } as never);

    await expect(
      action.execute({
        eventId,
        userId: otherUserId,
        updateData: { place: placeId },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_PLACE_FORBIDDEN,
      statusCode: 403,
    });

    expect(eventRepository.updateOne).not.toHaveBeenCalled();
  });
});
