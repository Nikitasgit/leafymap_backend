import {
  FollowingUserProfile,
  IFollowRepository,
} from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetFollowingInput } from "@src/application/dtos/follows/getFollowing.dto";

class GetFollowingUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(input: GetFollowingInput): Promise<FollowingUserProfile[]> {
    return this.followRepository.findFollowingOf(UserId.from(input.userId));
  }
}

export default GetFollowingUseCase;
