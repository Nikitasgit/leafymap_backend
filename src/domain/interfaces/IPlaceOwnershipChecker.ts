import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IPlaceOwnershipChecker {
  assertOwnedBy(placeId: PlaceId, userId: UserId): Promise<void>;
}
