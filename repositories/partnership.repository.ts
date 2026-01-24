import { Partnership } from "../models/Partnership";
import { IPartnership } from "@/types/models/partnership";
import {
  IPartnershipRepository,
  PartnershipFilters,
} from "@/types/repositories/partnership.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class PartnershipRepository implements IPartnershipRepository {
  private buildQuery(filters?: PartnershipFilters): FilterQuery<IPartnership> {
    const query: FilterQuery<IPartnership> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (filters.place) {
      query.place = new Types.ObjectId(filters.place);
    }
    if (filters.event) {
      query.event = new Types.ObjectId(filters.event);
    }
    if (filters.initiator) {
      query.initiator = new Types.ObjectId(filters.initiator);
    }
    if (filters.collaborator) {
      query.collaborator = new Types.ObjectId(filters.collaborator);
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }
    if (filters.$or) {
      query.$or = filters.$or.map((condition) => {
        const orQuery: any = {};
        if (condition.initiator) {
          orQuery.initiator = new Types.ObjectId(condition.initiator);
        }
        if (condition.collaborator) {
          orQuery.collaborator = new Types.ObjectId(condition.collaborator);
        }
        return orQuery;
      });
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "_id",
          "place",
          "event",
          "initiator",
          "collaborator",
          "type",
          "status",
          "deleted",
          "$or",
        ].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(partnership: Partial<IPartnership>): Promise<Types.ObjectId> {
    const newPartnership = await Partnership.create(partnership);
    return newPartnership._id;
  }

  async findById(
    id: string,
    project?: (keyof IPartnership | string)[]
  ): Promise<IPartnership | null> {
    let query = Partnership.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    const partnership = (await query.lean()) as any;
    return partnership as IPartnership | null;
  }

  async findOne(
    filter: Partial<IPartnership>,
    project?: (keyof IPartnership | string)[]
  ): Promise<IPartnership | null> {
    let query = Partnership.findOne(filter as any);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" ")) as any;
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    const partnership = (await query.lean()) as any;
    return partnership as IPartnership | null;
  }

  async findAll<K extends keyof IPartnership>(params: {
    filters?: PartnershipFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IPartnership, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Partnership.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    } else {
      mongooseQuery = mongooseQuery.sort({ updatedAt: -1 });
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

    const partnerships = (await mongooseQuery.lean()) as any;
    return partnerships as Pick<IPartnership, K>[];
  }

  async updateOne(id: string, update: Partial<IPartnership>): Promise<void> {
    await Partnership.findByIdAndUpdate(id, update as any).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Partnership.findByIdAndDelete(id).exec();
  }

  async deleteMany(filters: PartnershipFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await Partnership.deleteMany(query).exec();
  }
}

export default PartnershipRepository;
