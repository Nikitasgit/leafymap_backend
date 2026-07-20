import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { FollowingUserProfileReadModel } from "@src/domain/read-models/follow.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetFollowingInput } from "@src/application/dtos/follows/getFollowing.dto";

class GetFollowingUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(
    input: GetFollowingInput
  ): Promise<FollowingUserProfileReadModel[]> {
    return this.followRepository.findFollowingOf(UserId.from(input.userId));
  }
}

export default GetFollowingUseCase;
