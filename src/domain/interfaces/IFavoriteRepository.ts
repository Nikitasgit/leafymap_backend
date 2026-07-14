import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";

export interface IFavoriteRepository {
  save(favorite: Favorite): Promise<FavoriteId>;
  findByUserAndReference(
    userId: UserId,
    referenceId: ReferenceId,
    referenceType: FavoriteReferenceType
  ): Promise<Favorite | null>;
  findReferenceIdsByUserAndType(
    userId: UserId,
    referenceType: FavoriteReferenceType
  ): Promise<string[]>;
  delete(id: FavoriteId): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<void>;
  deleteAllByReference(
    referenceId: ReferenceId,
    referenceType: FavoriteReferenceType
  ): Promise<void>;
}
