import { IFollow } from "../models/follow";
import { Types } from "mongoose";

export interface FollowFilters {
  follower?: string;
  following?: string;
  _id?: string;
  [key: string]: unknown;
}

export interface IFollowRepository {
  create(follow: Partial<IFollow>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IFollow | string)[]
  ): Promise<IFollow | null>;
  findOne(
    filter: Partial<IFollow>,
    project?: (keyof IFollow | string)[]
  ): Promise<IFollow | null>;
  findAll<K extends keyof IFollow>(params: {
    filters?: FollowFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IFollow, K>[]>;
  deleteOne(id: string): Promise<void>;
}
