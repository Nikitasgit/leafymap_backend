import { Types } from "mongoose";
import DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (id = mockObjectId()) =>
  User.reconstitute({
    id: UserId.from(id),
    email: "user@example.com",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("DeleteAccountUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: DeleteAccountUseCase;
  const placeRepository = {
    findIdsByUserId: jest.fn().mockResolvedValue([]),
  };
  const eventRepository = {
    findIdsByOwner: jest.fn().mockResolvedValue([]),
    removeCollaborator: jest.fn(),
  };
  const partnershipRepository = { deleteManyByUserId: jest.fn() };
  const eventBookingRepository = { deleteManyByUserId: jest.fn() };
  const eventInvitationRepository = { deleteManyByUserId: jest.fn() };
  const favoriteRepository = { deleteAllByUserId: jest.fn() };
  const followRepository = { deleteAllInvolvingUser: jest.fn() };
  const productRepository = { deleteManyByUserId: jest.fn() };
  const notificationRepository = { deleteByUser: jest.fn() };
  const imageRepository = {
    findIdsByUserId: jest.fn().mockResolvedValue([]),
    findIdsByReferences: jest.fn().mockResolvedValue([]),
  };
  const cascadeDeleter = {
    deletePlace: jest.fn(),
    deleteEvents: jest.fn(),
    deleteImagesWithComments: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = createMockUserRepository();
    useCase = new DeleteAccountUseCase(
      userRepository,
      placeRepository as never,
      eventRepository as never,
      partnershipRepository as never,
      eventBookingRepository as never,
      eventInvitationRepository as never,
      favoriteRepository as never,
      followRepository as never,
      productRepository as never,
      notificationRepository as never,
      imageRepository as never,
      cascadeDeleter
    );
  });

  it("cascades related data then hard-deletes the user", async () => {
    const userId = mockObjectId();
    userRepository.findById.mockResolvedValue(buildUser(userId));

    await useCase.execute({ userId });

    expect(followRepository.deleteAllInvolvingUser).toHaveBeenCalled();
    expect(cascadeDeleter.deleteImagesWithComments).toHaveBeenCalledWith([]);
    expect(userRepository.deleteOne).toHaveBeenCalledWith(userId);
  });

  it("throws when the user is not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: mockObjectId() })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_NOT_FOUND,
    });
    expect(userRepository.deleteOne).not.toHaveBeenCalled();
  });
});
