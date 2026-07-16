import {
  FollowingUserProfile,
  IFollowRepository,
} from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface FindFollowingInput {
  userId: string;
}

export interface IFindFollowingUseCase {
  execute(input: FindFollowingInput): Promise<FollowingUserProfile[]>;
}

class FindFollowingUseCase implements IFindFollowingUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(input: FindFollowingInput): Promise<FollowingUserProfile[]> {
    return this.followRepository.findFollowingOf(UserId.from(input.userId));
  }
}

export default FindFollowingUseCase;
