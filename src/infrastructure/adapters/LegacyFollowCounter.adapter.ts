import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import FollowService from "@/services/followService";

class LegacyFollowCounterAdapter implements IFollowCounter {
  constructor(private readonly followService: FollowService) {}

  async increment(userId: UserId): Promise<void> {
    await this.followService.incrementFollowersCount(userId);
  }

  async decrement(userId: UserId): Promise<void> {
    await this.followService.decrementFollowersCount(userId);
  }
}

export default LegacyFollowCounterAdapter;
