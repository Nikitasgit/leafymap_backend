import { CreateEventAction } from "@/actions/events";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { Types } from "mongoose";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildCreateEventData,
  createMockRepository,
} from "../../helpers/mockRepositories";

describe("CreateEventAction", () => {
  let eventRepository: jest.Mocked<IEventRepository>;
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let action: CreateEventAction;

  beforeEach(() => {
    eventRepository = createMockRepository<IEventRepository>(
      "aggregate",
      "updateMany"
    );
    placeRepository = createMockRepository<IPlaceRepository>("aggregate");
    action = new CreateEventAction(eventRepository, placeRepository);
  });

  it("creates an event with an owned place", async () => {
    const userId = new Types.ObjectId().toString();
    const placeId = new Types.ObjectId().toString();
    const eventId = new Types.ObjectId();

    placeRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(placeId),
      user: new Types.ObjectId(userId),
    } as any);
    eventRepository.create.mockResolvedValue(eventId);

    const result = await action.execute({
      eventData: buildCreateEventData({
        user: userId,
        place: placeId,
        online: false,
      }),
    });

    expect(result).toEqual({ _id: eventId.toString() });
    expect(placeRepository.findById).toHaveBeenCalledWith(placeId, ["user"]);
    expect(eventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userId,
        place: placeId,
        location: null,
        online: false,
        deleted: false,
      })
    );
  });

  it("rejects an event with a place owned by another user", async () => {
    const userId = new Types.ObjectId().toString();
    const placeId = new Types.ObjectId().toString();

    placeRepository.findById.mockResolvedValue({
      _id: new Types.ObjectId(placeId),
      user: new Types.ObjectId(),
    } as any);

    await expect(
      action.execute({
        eventData: buildCreateEventData({
          user: userId,
          place: placeId,
          online: false,
        }),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EVENT_PLACE_FORBIDDEN,
      statusCode: 403,
    });

    expect(eventRepository.create).not.toHaveBeenCalled();
  });
});
