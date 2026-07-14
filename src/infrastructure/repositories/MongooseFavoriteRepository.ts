import { IFavoriteRepository } from "@src/domain/interfaces/IFavoriteRepository";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { FavoriteMapper } from "@src/infrastructure/mappers/Favorite.mapper";
import FavoriteModel from "@src/infrastructure/persistence/schemas/Favorite.schema";
import { Types } from "mongoose";

class MongooseFavoriteRepository implements IFavoriteRepository {
  async save(favorite: Favorite): Promise<FavoriteId> {
    const document = await FavoriteModel.create(
      FavoriteMapper.toPersistence(favorite)
    );
    return FavoriteId.from(document._id.toString());
  }

  async findByUserAndReference(
    userId: UserId,
    referenceId: ReferenceId,
    referenceType: FavoriteReferenceType
  ): Promise<Favorite | null> {
    const document = await FavoriteModel.findOne({
      user: new Types.ObjectId(userId),
      reference: new Types.ObjectId(referenceId),
      referenceType,
    }).lean();

    if (!document) {
      return null;
    }

    return FavoriteMapper.toDomain(
      document as FavoriteDocumentWithId
    );
  }

  async findReferenceIdsByUserAndType(
    userId: UserId,
    referenceType: FavoriteReferenceType
  ): Promise<string[]> {
    const documents = await FavoriteModel.find({
      user: new Types.ObjectId(userId),
      referenceType,
    })
      .select("reference")
      .sort({ createdAt: -1 })
      .lean();

    return documents.map((doc) => doc.reference.toString());
  }

  async delete(id: FavoriteId): Promise<void> {
    await FavoriteModel.findByIdAndDelete(id).exec();
  }

  async deleteAllByUserId(userId: UserId): Promise<void> {
    await FavoriteModel.deleteMany({
      user: new Types.ObjectId(userId),
    }).exec();
  }

  async deleteAllByReference(
    referenceId: ReferenceId,
    referenceType: FavoriteReferenceType
  ): Promise<void> {
    await FavoriteModel.deleteMany({
      reference: new Types.ObjectId(referenceId),
      referenceType,
    }).exec();
  }
}

type FavoriteDocumentWithId = {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: FavoriteReferenceType;
  createdAt?: Date;
  updatedAt?: Date;
};

export default MongooseFavoriteRepository;
