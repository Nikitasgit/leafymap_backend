import { Types } from "mongoose";
import DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("DeleteFollowUseCase", () => {
  let followRepository: jest.Mocked<IFollowRepository>;
  let followCounter: jest.Mocked<IFollowCounter>;
  let useCase: DeleteFollowUseCase;

  beforeEach(() => {
    followRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByPair: jest.fn(),
      findFollowersOf: jest.fn(),
      findFollowingOf: jest.fn(),
      delete: jest.fn(),
      deleteAllInvolvingUser: jest.fn(),
    };
    followCounter = {
      increment: jest.fn(),
      decrement: jest.fn(),
    };
    useCase = new DeleteFollowUseCase(followRepository, followCounter);
  });

  it("deletes a follow owned by the follower and decrements counter", async () => {
    const followId = mockObjectId();
    const followerId = mockObjectId();
    const followingId = mockObjectId();

    followRepository.findById.mockResolvedValue(
      Follow.reconstitute({
        id: FollowId.from(followId),
        followerId: UserId.from(followerId),
        followingId: UserId.from(followingId),
        createdAt: new Date(),
      })
    );

    await useCase.execute({ followId, followerId });

    expect(followRepository.delete).toHaveBeenCalledWith(
      FollowId.from(followId)
    );
    expect(followCounter.decrement).toHaveBeenCalledWith(
      UserId.from(followingId)
    );
  });

  it("rejects when the follow does not exist", async () => {
    followRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        followId: mockObjectId(),
        followerId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FOLLOW_NOT_FOUND,
    });

    expect(followRepository.delete).not.toHaveBeenCalled();
  });

  it("rejects when the follower does not own the follow", async () => {
    const followId = mockObjectId();
    const ownerId = mockObjectId();
    const otherUserId = mockObjectId();

    followRepository.findById.mockResolvedValue(
      Follow.reconstitute({
        id: FollowId.from(followId),
        followerId: UserId.from(ownerId),
        followingId: UserId.from(mockObjectId()),
        createdAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ followId, followerId: otherUserId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FOLLOW_FORBIDDEN,
    });

    expect(followRepository.delete).not.toHaveBeenCalled();
  });
});
