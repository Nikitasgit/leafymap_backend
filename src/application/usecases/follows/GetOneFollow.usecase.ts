import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  GetOneFollowInput,
  GetOneFollowOutput,
} from "@src/application/dtos/follows/getOneFollow.dto";

class GetOneFollowUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(input: GetOneFollowInput): Promise<GetOneFollowOutput | null> {
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

export default GetOneFollowUseCase;
