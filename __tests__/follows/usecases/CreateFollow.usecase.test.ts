import { Types } from "mongoose";
import CreateFollowUseCase from "@src/application/usecases/follows/CreateFollow.usecase";
import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("CreateFollowUseCase", () => {
  let followRepository: jest.Mocked<IFollowRepository>;
  let followCounter: jest.Mocked<IFollowCounter>;
  let followNotifier: jest.Mocked<IFollowNotifier>;
  let useCase: CreateFollowUseCase;

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
    followNotifier = {
      notifyNewFollower: jest.fn(),
    };
    useCase = new CreateFollowUseCase(
      followRepository,
      followCounter,
      followNotifier
    );
  });

  it("creates a follow, increments counter and notifies", async () => {
    const followerId = mockObjectId();
    const followingId = mockObjectId();
    const followId = mockObjectId();

    followRepository.findByPair.mockResolvedValue(null);
    followRepository.save.mockResolvedValue(FollowId.from(followId));

    const result = await useCase.execute({ followerId, followingId });

    expect(result).toEqual({ id: followId });
    expect(followRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        followerId: UserId.from(followerId),
        followingId: UserId.from(followingId),
      })
    );
    expect(followCounter.increment).toHaveBeenCalledWith(
      UserId.from(followingId)
    );
    expect(followNotifier.notifyNewFollower).toHaveBeenCalledWith({
      senderId: UserId.from(followerId),
      receiverId: UserId.from(followingId),
      followId: FollowId.from(followId),
    });
  });

  it("rejects self-follow", async () => {
    const userId = mockObjectId();

    await expect(
      useCase.execute({ followerId: userId, followingId: userId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FOLLOW_SELF_NOT_ALLOWED,
      statusCode: 400,
    });

    expect(followRepository.save).not.toHaveBeenCalled();
  });

  it("rejects when the follow already exists", async () => {
    const followerId = mockObjectId();
    const followingId = mockObjectId();

    followRepository.findByPair.mockResolvedValue(
      Follow.reconstitute({
        id: FollowId.from(mockObjectId()),
        followerId: UserId.from(followerId),
        followingId: UserId.from(followingId),
        createdAt: new Date(),
      })
    );

    await expect(
      useCase.execute({ followerId, followingId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.FOLLOW_ALREADY_EXISTS,
      statusCode: 409,
    });

    expect(followRepository.save).not.toHaveBeenCalled();
  });
});
