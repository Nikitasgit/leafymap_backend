import { Types } from "mongoose";
import CreatePlaceAction from "@/actions/places/CreatePlace.action";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import {
  buildUser,
  createMockRepository,
  mockObjectId,
} from "../../helpers/mockRepositories";

const basePlaceData = {
  location: {
    type: "Point" as const,
    coordinates: [2.3522, 48.8566] as [number, number],
    label: "Paris",
    id: "paris",
  },
  placeCategory: new Types.ObjectId().toString(),
};

describe("CreatePlaceAction", () => {
  let placeRepository: jest.Mocked<IPlaceRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let action: CreatePlaceAction;

  beforeEach(() => {
    placeRepository = createMockRepository<IPlaceRepository>();
    userRepository = createMockRepository<IUserRepository>();
    action = new CreatePlaceAction(placeRepository, userRepository);
  });

  it("creates a place and links it to the user", async () => {
    const userId = mockObjectId();
    const placeId = new Types.ObjectId();

    userRepository.findOne.mockResolvedValue(buildUser({ place: undefined }) as never);
    placeRepository.create.mockResolvedValue(placeId);

    const result = await action.execute({
      placeData: basePlaceData,
      userId,
    });

    expect(result).toEqual({ _id: placeId.toString() });
    expect(placeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        placeCategory: expect.any(Types.ObjectId),
        user: expect.any(Types.ObjectId),
      })
    );
    expect(userRepository.updateOne).toHaveBeenCalledWith(userId, {
      place: placeId,
    });
  });

  it("rejects when the user does not exist", async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      action.execute({ placeData: basePlaceData, userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_NOT_FOUND,
      statusCode: 404,
    });

    expect(placeRepository.create).not.toHaveBeenCalled();
  });

  it("rejects when the user already has a place", async () => {
    userRepository.findOne.mockResolvedValue(
      buildUser({ place: new Types.ObjectId() }) as never
    );

    await expect(
      action.execute({ placeData: basePlaceData, userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_ALREADY_HAS_PLACE,
      statusCode: 409,
    });

    expect(placeRepository.create).not.toHaveBeenCalled();
  });
});
