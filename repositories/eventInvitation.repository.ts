import { EventInvitation } from "../models/EventInvitation";
import Event from "../models/Event";
import { IEventInvitation } from "@/types/models/eventInvitation";
import { IEvent } from "@/types/models/event";
import {
  IEventInvitationRepository,
  EventInvitationFilters,
  EventInvitationUserFilters,
} from "@/types/repositories/eventInvitation.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class EventInvitationRepository implements IEventInvitationRepository {
  private buildQuery(
    filters?: EventInvitationFilters
  ): FilterQuery<IEventInvitation> {
    const query: FilterQuery<IEventInvitation> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }
    if (filters.eventIn && filters.eventIn.length > 0) {
      query.event = {
        $in: filters.eventIn.map((id) => new Types.ObjectId(id)),
      } as any;
    } else if (filters.event) {
      query.event = new Types.ObjectId(filters.event);
    }
    if (filters.initiator) {
      query.initiator = new Types.ObjectId(filters.initiator);
    }
    if (filters.collaborator) {
      query.collaborator = new Types.ObjectId(filters.collaborator);
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }
    if (filters.$or) {
      query.$or = filters.$or.map((condition) => {
        const orQuery: Record<string, Types.ObjectId | string> = {};
        if (condition.initiator) {
          orQuery.initiator = new Types.ObjectId(condition.initiator);
        }
        if (condition.collaborator) {
          orQuery.collaborator = new Types.ObjectId(condition.collaborator);
        }
        if (typeof condition.status === "string") {
          orQuery.status = condition.status;
        }
        return orQuery;
      });
    }
    if (filters.$and) {
      query.$and = filters.$and;
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "_id",
          "event",
          "eventIn",
          "initiator",
          "collaborator",
          "status",
          "deleted",
          "$or",
          "$and",
        ].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  private buildUserFilters(
    filters: EventInvitationUserFilters
  ): EventInvitationFilters {
    const queryFilters: EventInvitationFilters = { deleted: false };

    if (filters.asCollaborator) {
      queryFilters.collaborator = filters.userId;
    } else {
      queryFilters.initiator = filters.userId;
    }

    if (filters.onlyPending) {
      queryFilters.status = "pending";
    } else if (filters.onlyAccepted) {
      queryFilters.status = "accepted";
    } else if (!filters.currentUserId) {
      queryFilters.status = "accepted";
    } else {
      queryFilters.$or = [
        { status: "accepted" },
        { initiator: filters.currentUserId },
        { collaborator: filters.currentUserId },
      ];
    }

    return queryFilters;
  }

  private async getEligibleEventIds(
    filters: EventInvitationUserFilters
  ): Promise<Types.ObjectId[] | null> {
    const needsEventFilter =
      filters.includeCancelledEvents !== true ||
      filters.includePastEvents !== true;

    if (!needsEventFilter) {
      return null;
    }

    const eventQuery: FilterQuery<IEvent> = { deleted: false };

    if (filters.includeCancelledEvents !== true) {
      eventQuery.status = { $ne: "cancelled" };
    }

    if (filters.includePastEvents !== true) {
      eventQuery.$or = [
        { lifecycleStatus: { $in: ["ongoing", "upcoming"] } },
        { lifecycleStatus: { $exists: false } },
      ];
    }

    const events = await Event.find(eventQuery).select("_id").lean();
    return events.map((event) => event._id);
  }

  async findAllForUser<K extends keyof IEventInvitation>(params: {
    filters: EventInvitationUserFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventInvitation, K>[]> {
    const queryFilters = this.buildUserFilters(params.filters);
    const eligibleEventIds = await this.getEligibleEventIds(params.filters);

    if (eligibleEventIds) {
      queryFilters.eventIn = eligibleEventIds.map((id) => id.toString());
    }

    return this.findAll({
      filters: queryFilters,
      project: params.project,
      limit: params.limit,
      sort: params.sort,
    });
  }

  async create(
    eventInvitation: Partial<IEventInvitation>
  ): Promise<Types.ObjectId> {
    const newEventInvitation = await EventInvitation.create(eventInvitation);
    return newEventInvitation._id;
  }

  async findById(
    id: string,
    project?: (keyof IEventInvitation | string)[]
  ): Promise<IEventInvitation | null> {
    let query = EventInvitation.findById(id);

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

    const eventInvitation = (await query.lean()) as any;
    return eventInvitation as IEventInvitation | null;
  }

  async findOne(
    filter: Partial<IEventInvitation>,
    project?: (keyof IEventInvitation | string)[]
  ): Promise<IEventInvitation | null> {
    let query = EventInvitation.findOne(filter as any);

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

    const eventInvitation = (await query.lean()) as any;
    return eventInvitation as IEventInvitation | null;
  }

  async findAll<K extends keyof IEventInvitation>(params: {
    filters?: EventInvitationFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventInvitation, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = EventInvitation.find(query);

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

    const eventInvitations = (await mongooseQuery.lean()) as any;
    return eventInvitations as unknown as Pick<IEventInvitation, K>[];
  }

  async updateOne(
    id: string,
    update: Partial<IEventInvitation>
  ): Promise<void> {
    await EventInvitation.findByIdAndUpdate(id, update as any).exec();
  }

  async updateMany(
    filters: EventInvitationFilters,
    update: Partial<IEventInvitation>
  ): Promise<number> {
    const query = this.buildQuery(filters);
    const result = await EventInvitation.updateMany(
      query,
      update as any
    ).exec();
    return result.modifiedCount ?? 0;
  }

  async deleteOne(id: string): Promise<void> {
    await EventInvitation.findByIdAndDelete(id).exec();
  }

  async deleteMany(filters: EventInvitationFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await EventInvitation.deleteMany(query).exec();
  }
}

export default EventInvitationRepository;
