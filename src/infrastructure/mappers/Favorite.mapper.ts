import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { FavoriteDocumentProps } from "@src/infrastructure/persistence/schemas/Favorite.schema";
import { Types } from "mongoose";

export class FavoriteMapper {
  static toDomain(doc: FavoriteDocumentProps & { _id: Types.ObjectId }): Favorite {
    return Favorite.reconstitute({
      id: FavoriteId.from(doc._id.toString()),
      userId: UserId.from(doc.user.toString()),
      referenceId: ReferenceId.from(doc.reference.toString()),
      referenceType: FavoriteReferenceType.from(doc.referenceType),
      createdAt: doc.createdAt ?? new Date(),
    });
  }

  static toPersistence(favorite: Favorite): Omit<FavoriteDocumentProps, "_id"> {
    return {
      user: new Types.ObjectId(favorite.userId),
      reference: new Types.ObjectId(favorite.referenceId),
      referenceType: favorite.referenceType,
    };
  }
}
