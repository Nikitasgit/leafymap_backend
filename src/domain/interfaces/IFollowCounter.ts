import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IFollowCounter {
  increment(userId: UserId): Promise<void>;
  decrement(userId: UserId): Promise<void>;
}
