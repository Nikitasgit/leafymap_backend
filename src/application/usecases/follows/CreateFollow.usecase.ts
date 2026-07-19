import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { IFollowNotifier } from "@src/domain/interfaces/IFollowNotifier";
import { Follow } from "@src/domain/entities/Follow.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  ValidationError,
} from "@src/shared/errors";
import {
  CreateFollowInput,
  CreateFollowOutput,
} from "@src/application/dtos/follows/createFollow.dto";

class CreateFollowUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly followCounter: IFollowCounter,
    private readonly followNotifier: IFollowNotifier
  ) {}

  async execute(input: CreateFollowInput): Promise<CreateFollowOutput> {
    const followerId = UserId.from(input.followerId);
    const followingId = UserId.from(input.followingId);

    if (Follow.isSelfFollow(followerId, followingId)) {
      throw new ValidationError(
        { followingId: "You cannot follow yourself" },
        ERROR_CODES.FOLLOW_SELF_NOT_ALLOWED,
        "You cannot follow yourself"
      );
    }

    const existing = await this.followRepository.findByPair(
      followerId,
      followingId
    );

    if (existing) {
      throw new ConflictError(
        ERROR_CODES.FOLLOW_ALREADY_EXISTS,
        "You are already following this user"
      );
    }

    const follow = Follow.create({ followerId, followingId });
    const id = await this.followRepository.save(follow);

    await this.followCounter.increment(followingId);
    await this.followNotifier.notifyNewFollower({
      senderId: followerId,
      receiverId: followingId,
      followId: id,
    });

    return { id };
  }
}

export default CreateFollowUseCase;
