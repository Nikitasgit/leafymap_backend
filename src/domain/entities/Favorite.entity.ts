import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";

export interface CreateFavoriteParams {
  userId: UserId;
  referenceId: ReferenceId;
  referenceType: FavoriteReferenceType;
}

export interface ReconstituteFavoriteParams extends CreateFavoriteParams {
  id: FavoriteId;
  createdAt: Date;
}

export class Favorite {
  private constructor(
    public readonly id: FavoriteId | null,
    public readonly userId: UserId,
    public readonly referenceId: ReferenceId,
    public readonly referenceType: FavoriteReferenceType,
    public readonly createdAt: Date
  ) {}

  static create(params: CreateFavoriteParams): Favorite {
    return new Favorite(
      null,
      params.userId,
      params.referenceId,
      params.referenceType,
      new Date()
    );
  }

  static reconstitute(params: ReconstituteFavoriteParams): Favorite {
    return new Favorite(
      params.id,
      params.userId,
      params.referenceId,
      params.referenceType,
      params.createdAt
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.userId === userId;
  }
}
