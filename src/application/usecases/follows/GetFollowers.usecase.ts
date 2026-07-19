import {
  FollowUserProfile,
  IFollowRepository,
} from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetFollowersInput } from "@src/application/dtos/follows/getFollowers.dto";

class GetFollowersUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(input: GetFollowersInput): Promise<FollowUserProfile[]> {
    return this.followRepository.findFollowersOf(UserId.from(input.userId));
  }
}

export default GetFollowersUseCase;
