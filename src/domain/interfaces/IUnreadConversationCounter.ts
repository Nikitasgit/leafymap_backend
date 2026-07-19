import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IUnreadConversationCounter {
  countForUser(userId: UserId): Promise<number>;
}
