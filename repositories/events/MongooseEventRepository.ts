import Event from "../../models/Event";
import { IEvent } from "../../types/models/event";
import { IEventRepository, EventFilters } from "./IEventRepository";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "../utils/PopulateParser";

class MongooseEventRepository implements IEventRepository {
  private buildQuery(filters?: EventFilters): FilterQuery<IEvent> {
    const query: FilterQuery<IEvent> = {};

    if (!filters) return query;

    if (filters.place) {
      if (typeof filters.place === "string") {
        query.place = new Types.ObjectId(filters.place);
      } else if ("$in" in filters.place) {
        query.place = {
          $in: filters.place.$in.map((id) => new Types.ObjectId(id)),
        };
      }
    }
    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters["schedule.timeSlots.collaborators"]) {
      query["schedule.timeSlots.collaborators"] =
        filters["schedule.timeSlots.collaborators"];
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "place",
          "_id",
          "deleted",
          "status",
          "schedule.timeSlots.collaborators",
        ].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(event: Partial<IEvent>): Promise<Types.ObjectId> {
    const newEvent = await Event.create(event);
    return newEvent._id;
  }

  async findById(
    id: string,
    project?: (keyof IEvent | string)[]
  ): Promise<IEvent | null> {
    let query = Event.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    const event = await query.lean();
    return event as IEvent | null;
  }

  async findAll<K extends keyof IEvent>(params: {
    filters?: EventFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEvent, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Event.find(query);

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
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as typeof mongooseQuery;
    }

    const events = await mongooseQuery.lean();
    return events as Pick<IEvent, K>[];
  }

  async updateOne(id: string, update: Partial<IEvent>): Promise<void> {
    await Event.findByIdAndUpdate(id, update).exec();
  }

  async updateMany(
    filters: EventFilters,
    update: Partial<IEvent>
  ): Promise<void> {
    const query = this.buildQuery(filters);
    await Event.updateMany(query, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Event.findByIdAndDelete(id).exec();
  }

  async deleteMany(filters: EventFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await Event.deleteMany(query).exec();
  }
}

export default MongooseEventRepository;
