import { IEventInvitationRepository } from "@src/domain/interfaces/IEventInvitationRepository";
import { EventInvitationUserListFilters } from "@src/domain/interfaces/IEventInvitationRepository";
import { EventInvitation } from "@src/domain/entities/EventInvitation.entity";
import {
  EventId,
  EventInvitationId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventInvitationMapper } from "@src/infrastructure/mappers/EventInvitation.mapper";
import EventInvitationModel, {
  EventInvitationDocumentProps,
} from "@src/infrastructure/persistence/schemas/EventInvitation.schema";
import EventModel from "@src/infrastructure/persistence/schemas/Event.schema";
import { FilterQuery, Types } from "mongoose";

type EventInvitationDocumentWithId = EventInvitationDocumentProps & {
  _id: Types.ObjectId;
};

const EVENT_LIST_POPULATE = [
  {
    path: "initiator",
    select: "_id username userCategory image googlePictureUrl deleted",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
  {
    path: "collaborator",
    select: "_id username userCategory image googlePictureUrl deleted",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
];

const USER_LIST_POPULATE = [
  {
    path: "initiator",
    select: "_id username image userCategory",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
  {
    path: "collaborator",
    select: "_id username image userCategory",
    populate: [
      { path: "image", select: "urls" },
      { path: "userCategory", select: "name" },
    ],
  },
  {
    path: "event",
    select:
      "_id name description image schedule status lifecycleStatus dateRange",
    populate: [{ path: "image", select: "urls" }],
  },
];

class MongooseEventInvitationRepository implements IEventInvitationRepository {
  async save(invitation: EventInvitation): Promise<EventInvitationId> {
    const document = await EventInvitationModel.create(
      EventInvitationMapper.toPersistence(invitation)
    );
    return EventInvitationId.from(document._id.toString());
  }

  async findById(id: EventInvitationId): Promise<EventInvitation | null> {
    const document = await EventInvitationModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return EventInvitationMapper.toDomain(
      document as EventInvitationDocumentWithId
    );
  }

  async update(invitation: EventInvitation): Promise<void> {
    if (!invitation.id) {
      return;
    }
    await EventInvitationModel.updateOne(
      { _id: invitation.id },
      {
        status: invitation.status,
        deleted: invitation.deleted,
        updatedAt: invitation.updatedAt,
      }
    ).exec();
  }

  async delete(id: EventInvitationId): Promise<void> {
    await EventInvitationModel.findByIdAndDelete(id).exec();
  }

  async findByEventAndCollaborator(
    eventId: EventId,
    collaboratorId: UserId
  ): Promise<EventInvitation | null> {
    const document = await EventInvitationModel.findOne({
      event: new Types.ObjectId(eventId),
      collaborator: new Types.ObjectId(collaboratorId),
    }).lean();

    if (!document) {
      return null;
    }
    return EventInvitationMapper.toDomain(
      document as EventInvitationDocumentWithId
    );
  }

  async findListByEvent(
    eventId: EventId
  ): Promise<Record<string, unknown>[]> {
    const invitations = await EventInvitationModel.find({
      event: new Types.ObjectId(eventId),
      deleted: false,
    })
      .select("_id initiator collaborator status deleted")
      .populate(EVENT_LIST_POPULATE)
      .sort({ updatedAt: -1 })
      .lean();

    return invitations as unknown as Record<string, unknown>[];
  }

  async findListForUser(
    filters: EventInvitationUserListFilters
  ): Promise<Record<string, unknown>[]> {
    const query = await this.buildUserQuery(filters);
    const invitations = await EventInvitationModel.find(query)
      .select("_id initiator collaborator status deleted updatedAt event")
      .populate(USER_LIST_POPULATE)
      .sort({ updatedAt: -1 })
      .lean();

    return invitations as unknown as Record<string, unknown>[];
  }

  async deleteManyByEventIds(eventIds: EventId[]): Promise<void> {
    if (eventIds.length === 0) return;
    await EventInvitationModel.deleteMany({
      event: { $in: eventIds.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async deleteManyByUserId(userId: UserId): Promise<void> {
    const typedUserId = new Types.ObjectId(userId);
    await EventInvitationModel.deleteMany({
      $or: [{ initiator: typedUserId }, { collaborator: typedUserId }],
    }).exec();
  }

  async cancelPendingByEventIds(eventIds: EventId[]): Promise<number> {
    if (eventIds.length === 0) return 0;
    const result = await EventInvitationModel.updateMany(
      {
        event: { $in: eventIds.map((id) => new Types.ObjectId(id)) },
        status: "pending",
      },
      { status: "cancelled", deleted: true }
    ).exec();
    return result.modifiedCount ?? 0;
  }

  private async buildUserQuery(
    filters: EventInvitationUserListFilters
  ): Promise<FilterQuery<EventInvitationDocumentProps>> {
    const query: FilterQuery<EventInvitationDocumentProps> = {
      deleted: false,
    };

    if (filters.asCollaborator) {
      query.collaborator = new Types.ObjectId(filters.userId);
    } else {
      query.initiator = new Types.ObjectId(filters.userId);
    }

    if (filters.onlyPending) {
      query.status = "pending";
    } else if (filters.onlyAccepted) {
      query.status = "accepted";
    } else if (!filters.currentUserId) {
      query.status = "accepted";
    } else {
      query.$or = [
        { status: "accepted" },
        { initiator: new Types.ObjectId(filters.currentUserId) },
        { collaborator: new Types.ObjectId(filters.currentUserId) },
      ];
    }

    const eligibleEventIds = await this.getEligibleEventIds(filters);
    if (eligibleEventIds) {
      query.event = { $in: eligibleEventIds };
    }

    return query;
  }

  private async getEligibleEventIds(
    filters: EventInvitationUserListFilters
  ): Promise<Types.ObjectId[] | null> {
    const needsEventFilter =
      filters.includeCancelledEvents !== true ||
      filters.includePastEvents !== true;

    if (!needsEventFilter) {
      return null;
    }

    const eventQuery: FilterQuery<Record<string, unknown>> = {
      deleted: false,
    };

    if (filters.includeCancelledEvents !== true) {
      eventQuery.status = { $ne: "cancelled" };
    }

    if (filters.includePastEvents !== true) {
      eventQuery.$or = [
        { lifecycleStatus: { $in: ["ongoing", "upcoming"] } },
        { lifecycleStatus: { $exists: false } },
      ];
    }

    const events = await EventModel.find(eventQuery).select("_id").lean();
    return events.map((event) => event._id);
  }
}

export default MongooseEventInvitationRepository;
