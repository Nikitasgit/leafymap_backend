import { Types } from "mongoose";
import FindOneFollowUseCase from "@src/application/usecases/follows/FindOneFollow.usecase";
import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { Follow } from "@src/domain/entities/Follow.entity";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("FindOneFollowUseCase", () => {
  let followRepository: jest.Mocked<IFollowRepository>;
  let useCase: FindOneFollowUseCase;

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
    useCase = new FindOneFollowUseCase(followRepository);
  });

  it("returns the follow id when it exists", async () => {
    const followerId = mockObjectId();
    const followingId = mockObjectId();
    const followId = mockObjectId();

    followRepository.findByPair.mockResolvedValue(
      Follow.reconstitute({
        id: FollowId.from(followId),
        followerId: UserId.from(followerId),
        followingId: UserId.from(followingId),
        createdAt: new Date(),
      })
    );

    const result = await useCase.execute({ followerId, followingId });

    expect(result).toEqual({ id: followId });
  });

  it("returns null when the follow does not exist", async () => {
    followRepository.findByPair.mockResolvedValue(null);

    const result = await useCase.execute({
      followerId: mockObjectId(),
      followingId: mockObjectId(),
    });

    expect(result).toBeNull();
  });
});
