import Notification from "@/models/Notification";
import { INotification } from "@/types/models/notification";
import {
  INotificationRepository,
  NotificationFilters,
  NotificationWithSender,
} from "@/types/repositories/notification.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class NotificationRepository implements INotificationRepository {
  private buildQuery(
    filters?: NotificationFilters
  ): FilterQuery<INotification> {
    const query: FilterQuery<INotification> = {};

    if (!filters) return query;

    if (filters.receiver) {
      query.receiver = new Types.ObjectId(filters.receiver);
    }
    if (filters.action) {
      query.action = filters.action;
    }
    if (filters.read !== undefined) {
      if (typeof filters.read === "object" && filters.read?.$ne === true) {
        query.$or = [{ read: { $ne: true } }, { read: null }];
      } else {
        query.read = filters.read as boolean;
      }
    }

    Object.keys(filters).forEach((key) => {
      if (!["receiver", "action", "read"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(notification: Partial<INotification>): Promise<Types.ObjectId> {
    const newNotification = await Notification.create(notification);
    return newNotification._id;
  }

  async findAll(params: {
    filters?: NotificationFilters;
    project: (keyof INotification | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<NotificationWithSender[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Notification.find(query);

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
      );
    }

    const docs = await mongooseQuery.lean().exec();
    return docs as NotificationWithSender[];
  }

  async markAsRead(
    notificationIds: Types.ObjectId[],
    receiverId: string
  ): Promise<number> {
    if (notificationIds.length === 0) return 0;
    const receiverObjectId = new Types.ObjectId(receiverId);
    const updateResult = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        receiver: receiverObjectId,
      },
      { $set: { read: true, readAt: new Date() } }
    );
    return updateResult.modifiedCount;
  }

  async markAllUserNotificationsAsRead(receiverId: string): Promise<number> {
    const receiverObjectId = new Types.ObjectId(receiverId);
    const updateResult = await Notification.updateMany(
      {
        receiver: receiverObjectId,
        $or: [{ read: { $ne: true } }, { read: null }],
      },
      { $set: { read: true, readAt: new Date() } }
    );
    return updateResult.modifiedCount;
  }

  async deleteByReferences(referenceIds: string[]): Promise<void> {
    if (referenceIds.length === 0) return;
    await Notification.deleteMany({
      reference: { $in: referenceIds.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async deleteByUser(userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    await Notification.deleteMany({
      $or: [{ sender: userObjectId }, { receiver: userObjectId }],
    }).exec();
  }
}

export default NotificationRepository;
