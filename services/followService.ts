import { IUserRepository } from "@/types/repositories/user.repository.types";

class FollowService {
  constructor(private userRepository: IUserRepository) {}


  async incrementFollowersCount(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId, ["followers"]);
    if (!user) {
      throw new Error("User not found");
    }

    const currentCount = typeof user.followers === "number" ? user.followers : 0;
    await this.userRepository.updateOne(userId, {
      followers: currentCount + 1,
    } as any);
  }

  async decrementFollowersCount(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId, ["followers"]);
    if (!user) {
      throw new Error("User not found");
    }

    const currentCount = typeof user.followers === "number" ? user.followers : 0;
    const newCount = Math.max(0, currentCount - 1);
    await this.userRepository.updateOne(userId, {
      followers: newCount,
    } as any);
  }
}

export default FollowService;
