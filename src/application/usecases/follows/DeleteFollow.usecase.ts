import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { FollowId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface DeleteFollowInput {
  followId: string;
  followerId: string;
}

export interface IDeleteFollowUseCase {
  execute(input: DeleteFollowInput): Promise<void>;
}

class DeleteFollowUseCase implements IDeleteFollowUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly followCounter: IFollowCounter
  ) {}

  async execute(input: DeleteFollowInput): Promise<void> {
    const followId = FollowId.from(input.followId);
    const followerId = UserId.from(input.followerId);

    const follow = await this.followRepository.findById(followId);

    if (!follow || !follow.id) {
      throw new NotFoundError(
        ERROR_CODES.FOLLOW_NOT_FOUND,
        "Follow not found"
      );
    }

    if (!follow.belongsTo(followerId)) {
      throw new ForbiddenError(
        ERROR_CODES.FOLLOW_FORBIDDEN,
        "You can only delete your own follows"
      );
    }

    await this.followRepository.delete(follow.id);
    await this.followCounter.decrement(follow.followingId);
  }
}

export default DeleteFollowUseCase;
