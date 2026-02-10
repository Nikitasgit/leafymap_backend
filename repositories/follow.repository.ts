import Follow from "../models/Follow";
import { IFollow } from "@/types/models/follow";
import {
  IFollowRepository,
  FollowFilters,
} from "@/types/repositories/follow.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class FollowRepository implements IFollowRepository {
  private buildQuery(filters?: FollowFilters): FilterQuery<IFollow> {
    const query: FilterQuery<IFollow> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (filters.follower) {
      query.follower = new Types.ObjectId(filters.follower);
    }
    if (filters.following) {
      query.following = new Types.ObjectId(filters.following);
    }

    Object.keys(filters).forEach((key) => {
      if (!["_id", "follower", "following"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(follow: Partial<IFollow>): Promise<Types.ObjectId> {
    const newFollow = await Follow.create(follow);
    return newFollow._id;
  }

  async findById(
    id: string,
    project?: (keyof IFollow | string)[]
  ): Promise<IFollow | null> {
    let query = Follow.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as typeof query;
    }

    const follow = (await query.lean()) as any;
    return follow as IFollow | null;
  }

  async findOne(
    filter: Partial<IFollow>,
    project?: (keyof IFollow | string)[]
  ): Promise<IFollow | null> {
    let query = Follow.findOne(filter as any);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(query, populateConfig) as typeof query;
    }

    const follow = (await query.lean()) as any;
    return follow as IFollow | null;
  }

  async findAll<K extends keyof IFollow>(params: {
    filters?: FollowFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IFollow, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Follow.find(query);

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

    const follows = (await mongooseQuery.lean()) as any;
    return follows as unknown as Pick<IFollow, K>[];
  }

  async deleteOne(id: string): Promise<void> {
    await Follow.findByIdAndDelete(id).exec();
  }
}

export default FollowRepository;
