import { IUserRepository } from "@/types/repositories/user.repository.types";

class FollowService {
  constructor(private userRepository: IUserRepository) {}

  async incrementFollowersCount(userId: string): Promise<void> {
    await this.userRepository.incrementFollowers(userId, 1);
  }

  async decrementFollowersCount(userId: string): Promise<void> {
    await this.userRepository.incrementFollowers(userId, -1);
  }
}

export default FollowService;
