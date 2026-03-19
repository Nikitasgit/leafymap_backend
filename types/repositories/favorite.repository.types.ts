import { IFavorite } from "../models/favorite";
import { Types } from "mongoose";

export interface FavoriteFilters {
  user?: string;
  reference?: string;
  referenceType?: string;
  _id?: string;
  [key: string]: unknown;
}

export interface IFavoriteRepository {
  create(favorite: Partial<IFavorite>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null>;
  findOne(
    filter: Partial<IFavorite>,
    project?: (keyof IFavorite | string)[]
  ): Promise<IFavorite | null>;
  findAll<K extends keyof IFavorite>(params: {
    filters?: FavoriteFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IFavorite, K>[]>;
  deleteOne(id: string): Promise<void>;
}
