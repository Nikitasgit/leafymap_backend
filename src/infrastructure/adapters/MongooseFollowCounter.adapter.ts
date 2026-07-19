import { IFollowCounter } from "@src/domain/interfaces/IFollowCounter";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class MongooseFollowCounterAdapter implements IFollowCounter {
  constructor(private readonly userRepository: IUserRepository) {}

  async increment(userId: UserId): Promise<void> {
    await this.userRepository.incrementFollowers(userId, 1);
  }

  async decrement(userId: UserId): Promise<void> {
    await this.userRepository.incrementFollowers(userId, -1);
  }
}

export default MongooseFollowCounterAdapter;
