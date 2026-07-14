import { IFavoriteRepository as ILegacyFavoriteRepository } from "@/types/repositories/favorite.repository.types";
import { IFavorite } from "@/types/models/favorite";
import { Favorite } from "@src/domain/entities/Favorite.entity";
import MongooseFavoriteRepository from "@src/infrastructure/repositories/MongooseFavoriteRepository";
import FavoriteModel from "@src/infrastructure/persistence/schemas/Favorite.schema";
import {
  FavoriteId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";
import { Types } from "mongoose";

/**
 * Bridges legacy consumers (CascadeDeleteService, DeleteAccount) to the new
 * domain repository without changing their interfaces.
 */
class LegacyFavoriteRepositoryAdapter implements ILegacyFavoriteRepository {
  constructor(private readonly repository: MongooseFavoriteRepository) {}

  async create(favorite: Partial<IFavorite>): Promise<Types.ObjectId> {
    if (!favorite.user || !favorite.reference || !favorite.referenceType) {
      throw new Error("Invalid favorite payload");
    }

    const id = await this.repository.save(
      Favorite.create({
        userId: UserId.from(favorite.user.toString()),
        referenceId: ReferenceId.from(favorite.reference.toString()),
        referenceType: FavoriteReferenceType.from(favorite.referenceType),
      })
    );

    return new Types.ObjectId(id);
  }

  async findById(
    id: string,
    _project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null> {
    const document = await FavoriteModel.findById(id).lean();
    return document as IFavorite | null;
  }

  async findOne(
    filter: Partial<IFavorite>,
    _project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null> {
    if (!filter.user || !filter.reference || !filter.referenceType) {
      return null;
    }

    const favorite = await this.repository.findByUserAndReference(
      UserId.from(filter.user.toString()),
      ReferenceId.from(filter.reference.toString()),
      FavoriteReferenceType.from(filter.referenceType)
    );

    if (!favorite || !favorite.id) {
      return null;
    }

    return {
      _id: new Types.ObjectId(favorite.id),
      user: new Types.ObjectId(favorite.userId),
      reference: new Types.ObjectId(favorite.referenceId),
      referenceType: favorite.referenceType,
      createdAt: favorite.createdAt,
      updatedAt: favorite.createdAt,
    } as IFavorite;
  }

  async findAll<K extends keyof IFavorite>(params: {
    filters?: {
      user?: string;
      reference?: string;
      referenceType?: string;
      _id?: string;
    };
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IFavorite, K>[]> {
    const query: Record<string, unknown> = {};

    if (params.filters?.user) {
      query.user = new Types.ObjectId(params.filters.user);
    }
    if (params.filters?.reference) {
      query.reference = new Types.ObjectId(params.filters.reference);
    }
    if (params.filters?.referenceType) {
      query.referenceType = params.filters.referenceType;
    }
    if (params.filters?._id) {
      query._id = new Types.ObjectId(params.filters._id);
    }

    let mongooseQuery = FavoriteModel.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    } else {
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project.length > 0) {
      mongooseQuery = mongooseQuery.select(params.project.join(" "));
    }

    const documents = await mongooseQuery.lean();
    return documents as unknown as Pick<IFavorite, K>[];
  }

  async updateOne(_id: string, _update: Partial<IFavorite>): Promise<void> {
    throw new Error("updateOne is not supported for favorites");
  }

  async deleteOne(id: string): Promise<void> {
    await this.repository.delete(FavoriteId.from(id));
  }

  async deleteMany(filters: {
    user?: string;
    reference?: string;
    referenceType?: string;
  }): Promise<void> {
    if (filters.user) {
      await this.repository.deleteAllByUserId(UserId.from(filters.user));
      return;
    }

    if (filters.reference && filters.referenceType) {
      await this.repository.deleteAllByReference(
        ReferenceId.from(filters.reference),
        FavoriteReferenceType.from(filters.referenceType)
      );
    }
  }
}

export default LegacyFavoriteRepositoryAdapter;
