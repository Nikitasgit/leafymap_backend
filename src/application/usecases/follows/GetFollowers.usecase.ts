import { IFollowRepository } from "@src/domain/interfaces/IFollowRepository";
import { FollowUserProfileReadModel } from "@src/domain/read-models/follow.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetFollowersInput } from "@src/application/dtos/follows/getFollowers.dto";

class GetFollowersUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(
    input: GetFollowersInput
  ): Promise<FollowUserProfileReadModel[]> {
    return this.followRepository.findFollowersOf(UserId.from(input.userId));
  }
}

export default GetFollowersUseCase;
