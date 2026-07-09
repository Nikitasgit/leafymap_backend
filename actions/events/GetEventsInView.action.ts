import { IEvent } from "@/types/models/event";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { parseJson } from "@/utils/jsonHandlers";
import { Types } from "mongoose";

export const MAX_EVENTS_IN_VIEW = 100;

export interface GetEventsInViewInput {
  ne: number[];
  sw: number[];
  /** JSON-encoded client-side filter string */
  clientFilters?: string;
  limit?: number;
}

export interface IGetEventsInViewAction {
  execute(params: {
    filters: GetEventsInViewInput;
  }): Promise<Partial<IEvent>[]>;
}

interface ClientFilters {
  eventCategories?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

const CLIENT_FILTERS_DEFAULTS: ClientFilters = {
  eventCategories: [],
  startDate: null,
  endDate: null,
};

const toObjectIds = (ids: string[]) => ids.map((id) => new Types.ObjectId(id));

class GetEventsInViewAction implements IGetEventsInViewAction {
  constructor(private eventRepository: IEventRepository) {}

  private buildPipeline(
    input: GetEventsInViewInput,
    filters: ClientFilters,
    limit: number
  ): unknown[] {
    const pipeline: Record<string, unknown>[] = [
      {
        $match: {
          deleted: { $ne: true },
          online: { $ne: true },
          status: { $ne: "cancelled" },
          lifecycleStatus: { $in: ["upcoming", "ongoing"] },
        },
      },
    ];

    if (filters.eventCategories?.length) {
      pipeline.push({
        $match: {
          eventCategory: { $in: toObjectIds(filters.eventCategories) },
        },
      });
    }

    const dateMatch: Record<string, unknown> = {};
    if (filters.startDate) {
      dateMatch["dateRange.latestDate"] = { $gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      dateMatch["dateRange.firstDate"] = { $lte: new Date(filters.endDate) };
    }
    if (Object.keys(dateMatch).length > 0) {
      pipeline.push({ $match: dateMatch });
    }

    pipeline.push(
      {
        $lookup: {
          from: "places",
          localField: "place",
          foreignField: "_id",
          pipeline: [{ $project: { location: 1, user: 1, placeCategory: 1 } }],
          as: "_place",
        },
      },
      {
        $unwind: { path: "$_place", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          displayLocation: { $ifNull: ["$location", "$_place.location"] },
        },
      },
      {
        $match: {
          "displayLocation.coordinates": {
            $geoWithin: { $box: [input.sw, input.ne] },
          },
        },
      },
      { $sort: { "dateRange.firstDate": 1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "eventcategories",
          localField: "eventCategory",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "_eventCategory",
        },
      },
      {
        $unwind: {
          path: "$_eventCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, image: 1 } }],
          as: "_user",
        },
      },
      {
        $unwind: { path: "$_user", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "images",
          localField: "image",
          foreignField: "_id",
          pipeline: [{ $project: { urls: 1 } }],
          as: "_image",
        },
      },
      {
        $unwind: { path: "$_image", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          name: 1,
          location: "$displayLocation",
          eventCategory: "$_eventCategory",
          user: "$_user",
          place: "$_place",
          image: "$_image",
          status: 1,
          lifecycleStatus: 1,
          dateRange: 1,
          isBookable: 1,
        },
      }
    );

    return pipeline;
  }

  async execute({
    filters,
  }: {
    filters: GetEventsInViewInput;
  }): Promise<Partial<IEvent>[]> {
    const clientFilters = parseJson<ClientFilters>(
      filters.clientFilters,
      CLIENT_FILTERS_DEFAULTS
    );
    const limit = Math.min(filters.limit ?? MAX_EVENTS_IN_VIEW, MAX_EVENTS_IN_VIEW);
    const pipeline = this.buildPipeline(filters, clientFilters, limit);

    return this.eventRepository.aggregate<Partial<IEvent>>(pipeline);
  }
}

export default GetEventsInViewAction;
