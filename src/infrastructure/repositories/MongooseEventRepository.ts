import {
  AdminEventSummary,
  EventInViewFilters,
  EventListFilters,
  IEventRepository,
  LifecycleEventSlice,
  SoftDeleteEventParams,
} from "@src/domain/interfaces/IEventRepository";
import { Event } from "@src/domain/entities/Event.entity";
import {
  EventDetailsReadModel,
  EventListItemReadModel,
} from "@src/domain/read-models/event.read-models";
import {
  EventDateRange,
  EventPeriod,
} from "@src/domain/value-objects/EventSchedule.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";
import {
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventMapper } from "@src/infrastructure/mappers/Event.mapper";
import { EventReadMapper } from "@src/infrastructure/read-mappers/Event.read-mapper";
import EventModel, {
  EventDocumentProps,
} from "@src/infrastructure/persistence/schemas/Event.schema";
import { PopulateParser } from "@src/infrastructure/persistence/utils/PopulateParser";
import { FilterQuery, Types } from "mongoose";

type EventDocumentWithId = EventDocumentProps & { _id: Types.ObjectId };

const LIST_PROJECT = [
  "_id",
  "name",
  "image",
  "eventCategory",
  "eventCategory.name",
  "place",
  "user",
  "location",
  "online",
  "description",
  "status",
  "lifecycleStatus",
  "schedule",
  "dateRange",
  "isBookable",
  "capacity",
  "maxSeatsPerBooking",
  "image._id",
  "image.urls",
  "place._id",
  "place.location",
  "place.user",
  "place.user.username",
  "user._id",
  "user.username",
  "user.image",
  "user.image.urls",
];

const DETAIL_PROJECT = [
  ...LIST_PROJECT,
  "rating",
  "createdAt",
  "updatedAt",
  "deleted",
  "schedule.timeSlots.collaborators",
  "schedule.timeSlots.collaborators._id",
  "schedule.timeSlots.collaborators.username",
  "schedule.timeSlots.collaborators.image",
  "schedule.timeSlots.collaborators.image.urls",
];

class MongooseEventRepository implements IEventRepository {
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async save(event: Event): Promise<EventId> {
    const document = await EventModel.create(EventMapper.toPersistence(event));
    return EventId.from(document._id.toString());
  }

  async findById(id: EventId): Promise<Event | null> {
    const document = await EventModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return EventMapper.toDomain(document as EventDocumentWithId);
  }

  async update(event: Event): Promise<void> {
    if (!event.id) {
      return;
    }
    await EventModel.findByIdAndUpdate(
      event.id,
      EventMapper.toPersistence(event)
    ).exec();
  }

  async findDetailById(
    id: EventId
  ): Promise<EventDetailsReadModel | null> {
    let query = EventModel.findById(id);
    const { selectFields, populateConfig } =
      PopulateParser.parseProjectFields(DETAIL_PROJECT);
    if (selectFields.length > 0) {
      query = query.select(selectFields.join(" "));
    }
    query = PopulateParser.applyPopulate(
      query,
      populateConfig
    ) as typeof query;
    const event = await query.lean();
    return event ? EventReadMapper.toDetail(event) : null;
  }

  async findList(
    filters: EventListFilters
  ): Promise<EventListItemReadModel[]> {
    const query: FilterQuery<EventDocumentProps> = { deleted: false };

    if (filters.placeId) {
      query.place = new Types.ObjectId(filters.placeId);
    }
    if (filters.userId) {
      query.user = new Types.ObjectId(filters.userId);
    }
    if (filters.search?.trim()) {
      query.name = {
        $regex: this.escapeRegex(filters.search.trim()),
        $options: "i",
      };
      query.status = { $ne: "cancelled" };
    }

    if (
      filters.lifecycleStatus &&
      filters.lifecycleStatus.length > 0 &&
      filters.lifecycleStatus.some((status) => status.trim() !== "")
    ) {
      query.lifecycleStatus = {
        $in: filters.lifecycleStatus.filter((status) => status.trim() !== ""),
      };
    } else if (filters.search?.trim()) {
      query.lifecycleStatus = { $in: ["upcoming", "ongoing"] };
    }

    const sortBy = filters.sortBy || "dateRange.firstDate";
    const order = filters.order === "desc" ? -1 : 1;

    let mongooseQuery = EventModel.find(query).sort({ [sortBy]: order });
    if (filters.limit) {
      mongooseQuery = mongooseQuery.limit(filters.limit);
    } else {
      mongooseQuery = mongooseQuery.limit(100);
    }

    const { selectFields, populateConfig } =
      PopulateParser.parseProjectFields(LIST_PROJECT);
    if (selectFields.length > 0) {
      mongooseQuery = mongooseQuery.select(selectFields.join(" "));
    }
    mongooseQuery = PopulateParser.applyPopulate(
      mongooseQuery,
      populateConfig
    ) as typeof mongooseQuery;

    const events = await mongooseQuery.lean();
    return EventReadMapper.toListItems(events);
  }

  async findInView(
    filters: EventInViewFilters
  ): Promise<EventListItemReadModel[]> {
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
          eventCategory: {
            $in: filters.eventCategories.map((id) => new Types.ObjectId(id)),
          },
        },
      });
    }

    const dateMatch: Record<string, unknown> = {};
    if (filters.startDate) {
      dateMatch["dateRange.latestDate"] = {
        $gte: new Date(filters.startDate),
      };
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
            $geoWithin: { $box: [filters.sw, filters.ne] },
          },
        },
      },
      { $sort: { "dateRange.firstDate": 1 } },
      { $limit: filters.limit },
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

    return EventReadMapper.toListItems(
      await EventModel.aggregate(pipeline as never[]).exec()
    );
  }

  async findAllForLifecycleUpdate(
    limit = 10000
  ): Promise<LifecycleEventSlice[]> {
    const events = await EventModel.find({ deleted: false })
      .select("_id schedule dateRange lifecycleStatus")
      .limit(limit)
      .lean();

    return events.map((event) => ({
      id: EventId.from(event._id.toString()),
      schedule: EventMapper.scheduleToDomain(event.schedule ?? []),
      dateRange: event.dateRange
        ? {
            firstDate: event.dateRange.firstDate
              ? new Date(event.dateRange.firstDate)
              : new Date(0),
            latestDate: event.dateRange.latestDate
              ? new Date(event.dateRange.latestDate)
              : new Date(0),
          }
        : undefined,
      lifecycleStatus: event.lifecycleStatus,
    }));
  }

  async updateLifecycleFields(
    id: EventId,
    fields: { dateRange?: EventDateRange; lifecycleStatus?: LifecycleStatus }
  ): Promise<void> {
    await EventModel.updateOne({ _id: id }, { $set: fields }).exec();
  }

  async updateRating(id: EventId, rating: number): Promise<void> {
    await EventModel.updateOne({ _id: id }, { $set: { rating } }).exec();
  }

  async softDelete(
    id: EventId,
    params: SoftDeleteEventParams
  ): Promise<void> {
    if (params.deleted) {
      await EventModel.updateOne(
        { _id: id },
        {
          $set: {
            deleted: true,
            deletedAt: new Date(),
            deletedBy: new Types.ObjectId(params.adminId),
            deleteReason: params.reason,
          },
        }
      ).exec();
      return;
    }

    await EventModel.updateOne(
      { _id: id },
      {
        $set: { deleted: false },
        $unset: { deletedAt: 1, deletedBy: 1, deleteReason: 1 },
      }
    ).exec();
  }

  async findIdsByPlace(placeId: PlaceId): Promise<EventId[]> {
    const events = await EventModel.find({ place: placeId })
      .select("_id")
      .lean();
    return events.map((event) => EventId.from(event._id.toString()));
  }

  async findIdsByOwner(userId: UserId): Promise<EventId[]> {
    const events = await EventModel.find({ user: userId }).select("_id").lean();
    return events.map((event) => EventId.from(event._id.toString()));
  }

  async deleteManyByIds(ids: EventId[]): Promise<void> {
    if (ids.length === 0) return;
    await EventModel.deleteMany({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async removeCollaborator(userId: UserId): Promise<void> {
    await EventModel.updateMany(
      { "schedule.timeSlots.collaborators": userId },
      {
        $pull: {
          "schedule.$[].timeSlots.$[].collaborators": new Types.ObjectId(
            userId
          ),
        },
      }
    ).exec();
  }

  async findScheduleById(id: EventId): Promise<EventPeriod[] | null> {
    const event = await EventModel.findById(id).select("schedule").lean();
    if (!event) {
      return null;
    }
    return EventMapper.scheduleToDomain(event.schedule ?? []);
  }

  async updateSchedule(id: EventId, schedule: EventPeriod[]): Promise<void> {
    await EventModel.findByIdAndUpdate(id, {
      schedule: EventMapper.scheduleToPersistence(schedule),
    }).exec();
  }

  async findByAuthorAdmin(
    userId: UserId,
    limit = 50
  ): Promise<AdminEventSummary[]> {
    const events = await EventModel.find({ user: userId })
      .select("_id name status lifecycleStatus deleted createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return events.map((event) => ({
      id: event._id.toString(),
      name: event.name,
      status: event.status,
      lifecycleStatus: event.lifecycleStatus,
      deleted: event.deleted ?? false,
      createdAt: event.createdAt ?? new Date(),
    }));
  }

  async findByPlaceInDateRange(
    placeId: PlaceId,
    start: Date,
    end: Date
  ): Promise<EventListItemReadModel[]> {
    const query: FilterQuery<EventDocumentProps> = {
      place: new Types.ObjectId(placeId),
      deleted: false,
      $or: [
        {
          schedule: {
            $elemMatch: {
              startDate: { $lte: end },
              $or: [
                { endDate: { $gte: start } },
                { endDate: { $exists: false } },
              ],
            },
          },
        },
        {
          schedule: {
            $elemMatch: {
              startDate: {
                $gte: start,
                $lte: end,
              },
            },
          },
        },
      ],
    };

    let mongooseQuery = EventModel.find(query);
    const { selectFields, populateConfig } = PopulateParser.parseProjectFields([
      "_id",
      "name",
      "schedule",
      "status",
      "deleted",
      "image.urls",
    ]);
    if (selectFields.length > 0) {
      mongooseQuery = mongooseQuery.select(selectFields.join(" "));
    }
    mongooseQuery = PopulateParser.applyPopulate(
      mongooseQuery,
      populateConfig
    ) as typeof mongooseQuery;

    const events = await mongooseQuery.lean();
    return EventReadMapper.toListItems(events);
  }

  async findOwnerId(id: EventId): Promise<UserId | null> {
    const event = await EventModel.findById(id).select("user").lean();
    if (!event?.user) {
      return null;
    }
    return UserId.from(event.user.toString());
  }
}

export default MongooseEventRepository;
