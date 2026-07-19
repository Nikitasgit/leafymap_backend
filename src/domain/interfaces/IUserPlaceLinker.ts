import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IUserPlaceLinker {
  assertCanCreatePlace(userId: UserId): Promise<void>;
  linkPlace(userId: UserId, placeId: PlaceId): Promise<void>;
  unlinkPlace(userId: UserId): Promise<void>;
}
