import User from "../../models/User";
import { IUser } from "../../types/models/user";
import { IUserRepository, UserFilters } from "./IUserRepository";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "../utils/PopulateParser";

class MongooseUserRepository implements IUserRepository {
  private buildQuery(filters?: UserFilters): FilterQuery<IUser> {
    const query: FilterQuery<IUser> = {};

    if (!filters) return query;

    if (filters._id) {
      if (typeof filters._id === "string") {
        query._id = new Types.ObjectId(filters._id);
      } else if ("$in" in filters._id && filters._id.$in) {
        query._id = {
          $in: filters._id.$in.map((id: string) => new Types.ObjectId(id)),
        };
      } else if ("$nin" in filters._id && filters._id.$nin) {
        query._id = {
          $nin: filters._id.$nin.map((id: string) => new Types.ObjectId(id)),
        };
      }
    }

    if (filters.email) {
      query.email = filters.email;
    }
    if (filters.username) {
      query.username = filters.username;
    }
    if (filters.creatorName) {
      query.creatorName = filters.creatorName;
    }
    if (filters.userType) {
      query.userType = filters.userType;
    }
    if (filters.deleted !== undefined) {
      query.deleted = filters.deleted;
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "_id",
          "email",
          "username",
          "creatorName",
          "userType",
          "deleted",
        ].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(user: Partial<IUser>): Promise<Types.ObjectId> {
    const newUser = new User(user);
    await newUser.save();
    return newUser._id;
  }

  async findById(
    id: string,
    project?: (keyof IUser | string)[]
  ): Promise<IUser | null> {
    let query = User.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as any;
    }

    const user = await query.lean();
    return user as unknown as IUser | null;
  }

  async findOne(
    filter: Partial<IUser> | { $or: Partial<IUser>[] },
    project?: (keyof IUser | string)[]
  ): Promise<IUser | null> {
    let query: any = User.findOne(filter as FilterQuery<IUser>);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as any;
    }

    const user = await query.lean();
    return user as unknown as IUser | null;
  }

  async findAll<K extends keyof IUser>(params: {
    filters?: UserFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IUser, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = User.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as any;
    }

    const users = await mongooseQuery.lean();
    return users as unknown as Pick<IUser, K>[];
  }

  async updateOne(id: string, update: Partial<IUser>): Promise<void> {
    await User.findByIdAndUpdate(id, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await User.findByIdAndDelete(id).exec();
  }
}

export default MongooseUserRepository;
