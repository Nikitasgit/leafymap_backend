import {
  FollowUserProfile,
  IFollowRepository,
} from "@src/domain/interfaces/IFollowRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface FindFollowersInput {
  userId: string;
}

export interface IFindFollowersUseCase {
  execute(input: FindFollowersInput): Promise<FollowUserProfile[]>;
}

class FindFollowersUseCase implements IFindFollowersUseCase {
  constructor(private readonly followRepository: IFollowRepository) {}

  async execute(input: FindFollowersInput): Promise<FollowUserProfile[]> {
    return this.followRepository.findFollowersOf(UserId.from(input.userId));
  }
}

export default FindFollowersUseCase;
