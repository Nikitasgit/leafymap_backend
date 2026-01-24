import { IUser } from "../models/user";
import { Types } from "mongoose";

export interface UserFilters {
  _id?: string | { $in: string[] } | { $nin: string[] };
  email?: string;
  username?: string | { $regex: string; $options: string };
  userType?: "creator" | "guest";
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
    filter: Partial<IUser> | { $or: Partial<IUser>[] },
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
    update: Partial<IUser>
  ): Promise<{ _id: string; userType: "creator" | "guest" } | null>;
  deleteOne(id: string): Promise<void>;
}
