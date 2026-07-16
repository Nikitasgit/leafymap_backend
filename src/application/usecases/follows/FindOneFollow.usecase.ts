import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface FindOneFollowInput {
  followerId: string;
  followingId: string;
}

export interface FindOneFollowOutput {
  id: string;
}

export interface IFindOneFollowUseCase {
  execute(input: FindOneFollowInput): Promise<FindOneFollowOutput | null>;
}

class FindOneFollowUseCase implements IFindOneFollowUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(
    input: FindOneFollowInput
  ): Promise<FindOneFollowOutput | null> {
    const follow = await this.followRepository.findByPair(
      UserId.from(input.followerId),
      UserId.from(input.followingId)
    );

    if (!follow || !follow.id) {
      return null;
    }

    return { id: follow.id };
  }
}

export default FindOneFollowUseCase;
