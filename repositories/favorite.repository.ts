import Favorite from "../models/Favorite";
import { IFavorite } from "@/types/models/favorite";
import {
  IFavoriteRepository,
  FavoriteFilters,
} from "@/types/repositories/favorite.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class FavoriteRepository implements IFavoriteRepository {
  private buildQuery(filters?: FavoriteFilters): FilterQuery<IFavorite> {
    const query: FilterQuery<IFavorite> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (filters.user) {
      query.user = new Types.ObjectId(filters.user);
    }
    if (filters.reference) {
      query.reference = new Types.ObjectId(filters.reference);
    }
    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }

    Object.keys(filters).forEach((key) => {
      if (!["_id", "user", "reference", "referenceType"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(favorite: Partial<IFavorite>): Promise<Types.ObjectId> {
    const newFavorite = await Favorite.create(favorite);
    return newFavorite._id;
  }

  async findById(
    id: string,
    project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null> {
    let query = Favorite.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as typeof query;
    }

    const favorite = (await query.lean()) as any;
    return favorite as IFavorite | null;
  }

  async findOne(
    filter: Partial<IFavorite>,
    project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null> {
    let query = Favorite.findOne(filter as any);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as typeof query;
    }

    const favorite = (await query.lean()) as any;
    return favorite as IFavorite | null;
  }

  async findAll<K extends keyof IFavorite>(params: {
    filters?: FavoriteFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IFavorite, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Favorite.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    } else {
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" ")) as any;
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as typeof mongooseQuery;
    }

    const favorites = (await mongooseQuery.lean()) as any;
    return favorites as unknown as Pick<IFavorite, K>[];
  }

  async deleteOne(id: string): Promise<void> {
    await Favorite.findByIdAndDelete(id).exec();
  }
}

export default FavoriteRepository;
