import { IUser } from "../models/user";
import { Types, FilterQuery } from "mongoose";

export interface UserFilters {
  _id?: string | { $in: string[] } | { $nin: string[] };
  email?: string;
  username?: string | { $regex: string; $options: string };
  userType?: "creator" | "guest";
  userCategory?: string | { $in: string[] };
  deleted?: boolean;
  [key: string]: unknown;
}

export interface IUserRepository {
  create(user: Partial<IUser>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IUser | string)[]
  ): Promise<IUser | null>;
  findOne(
    filter: FilterQuery<IUser>,
    project?: (keyof IUser | string)[]
  ): Promise<IUser | null>;
  findAll<K extends keyof IUser>(params: {
    filters?: UserFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IUser, K>[]>;
  updateOne(
    id: string,
    update:
      | Partial<IUser>
      | { $set?: Partial<IUser>; $unset?: Record<string, 1> }
  ): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
