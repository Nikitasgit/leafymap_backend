import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IUserPlaceResolver {
  findPlaceIdByUserId(userId: UserId): Promise<PlaceId | null>;
}
