import { EventBooking } from "../models/EventBooking";
import { IEventBooking } from "@/types/models/eventBooking";
import {
  IEventBookingRepository,
  EventBookingFilters,
} from "@/types/repositories/eventBooking.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class EventBookingRepository implements IEventBookingRepository {
  private buildQuery(
    filters?: EventBookingFilters
  ): FilterQuery<IEventBooking> {
    const query: FilterQuery<IEventBooking> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (filters.event) {
      query.event = new Types.ObjectId(filters.event);
    }
    if (filters.user) {
      query.user = new Types.ObjectId(filters.user);
    }
    if (filters.status) {
      query.status = filters.status;
    }

    Object.keys(filters).forEach((key) => {
      if (!["_id", "event", "user", "status", "deleted"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(eventBooking: Partial<IEventBooking>): Promise<Types.ObjectId> {
    const newEventBooking = await EventBooking.create(eventBooking);
    return newEventBooking._id;
  }

  async findById(
    id: string,
    project?: (keyof IEventBooking | string)[]
  ): Promise<IEventBooking | null> {
    let query = EventBooking.findById(id);

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

    const eventBooking = (await query.lean()) as any;
    return eventBooking as IEventBooking | null;
  }

  async findOne(
    filter: Partial<IEventBooking>,
    project?: (keyof IEventBooking | string)[]
  ): Promise<IEventBooking | null> {
    let query = EventBooking.findOne(filter as any);

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

    const eventBooking = (await query.lean()) as any;
    return eventBooking as IEventBooking | null;
  }

  async findAll<K extends keyof IEventBooking>(params: {
    filters?: EventBookingFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventBooking, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = EventBooking.find(query);

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

    const eventBookings = (await mongooseQuery.lean()) as any;
    return eventBookings as unknown as Pick<IEventBooking, K>[];
  }

  async updateOne(id: string, update: Partial<IEventBooking>): Promise<void> {
    await EventBooking.findByIdAndUpdate(id, update as any).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await EventBooking.findByIdAndDelete(id).exec();
  }

  async sumConfirmedSeats(
    eventId: string,
    excludeBookingId?: string
  ): Promise<number> {
    const match: Record<string, unknown> = {
      event: new Types.ObjectId(eventId),
      status: "confirmed",
    };

    if (excludeBookingId) {
      match._id = { $ne: new Types.ObjectId(excludeBookingId) };
    }

    const result = await EventBooking.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$seats" } } },
    ]);

    return result[0]?.total ?? 0;
  }
}

export default EventBookingRepository;
