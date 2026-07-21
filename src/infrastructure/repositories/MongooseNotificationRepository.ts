import { Notification } from "@src/domain/entities/Notification.entity";
import {
  ExistsRecentSimilarParams,
  INotificationRepository,
} from "@src/domain/interfaces/INotificationRepository";
import { NotificationListItem } from "@src/domain/read-models/notification.read-models";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { NotificationMapper } from "@src/infrastructure/mappers/Notification.mapper";
import NotificationModel, {
  NotificationDocumentProps,
} from "@src/infrastructure/persistence/schemas/Notification.schema";
import { NotificationReadMapper } from "@src/infrastructure/read-mappers/Notification.read-mapper";
import { FilterQuery, Types } from "mongoose";

const SENDER_POPULATE = {
  path: "sender",
  select: "username firstname lastname image googlePictureUrl",
  populate: {
    path: "image",
    select: "urls",
  },
};

type PopulatedSender = {
  _id: Types.ObjectId;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
  googlePictureUrl?: string;
};

type LeanNotificationWithSender = Omit<NotificationDocumentProps, "sender"> & {
  _id: Types.ObjectId;
  sender?: Types.ObjectId | PopulatedSender;
};

class MongooseNotificationRepository implements INotificationRepository {
  async save(notification: Notification): Promise<NotificationId> {
    const document = await NotificationModel.create(
      NotificationMapper.toPersistence(notification)
    );
    return NotificationId.from(document._id.toString());
  }

  async findRecentForReceiver(
    receiverId: UserId,
    options?: { limit?: number }
  ): Promise<NotificationListItem[]> {
    const documents = await NotificationModel.find({
      receiver: new Types.ObjectId(receiverId),
    })
      .select(
        "_id action reference referenceType read readAt createdAt updatedAt sender"
      )
      .populate(SENDER_POPULATE)
      .sort({ createdAt: -1 })
      .limit(options?.limit ?? 50)
      .lean<LeanNotificationWithSender[]>();

    return NotificationReadMapper.toListItems(documents);
  }

  async markAsReadByAction(
    receiverId: UserId,
    action: NotificationAction
  ): Promise<number> {
    const receiverObjectId = new Types.ObjectId(receiverId);
    const unread = await NotificationModel.find({
      receiver: receiverObjectId,
      action,
      $or: [{ read: { $ne: true } }, { read: null }],
    })
      .select("_id")
      .lean();

    if (unread.length === 0) {
      return 0;
    }

    const updateResult = await NotificationModel.updateMany(
      {
        _id: { $in: unread.map((doc) => doc._id) },
        receiver: receiverObjectId,
      },
      { $set: { read: true, readAt: new Date() } }
    );

    return updateResult.modifiedCount;
  }

  async markAllAsRead(receiverId: UserId): Promise<number> {
    const updateResult = await NotificationModel.updateMany(
      {
        receiver: new Types.ObjectId(receiverId),
        $or: [{ read: { $ne: true } }, { read: null }],
      },
      { $set: { read: true, readAt: new Date() } }
    );
    return updateResult.modifiedCount;
  }

  async existsRecentSimilar(
    params: ExistsRecentSimilarParams
  ): Promise<boolean> {
    const query: FilterQuery<NotificationDocumentProps> = {
      _id: { $ne: new Types.ObjectId(params.excludeId) },
      receiver: new Types.ObjectId(params.receiverId),
      action: params.action,
      createdAt: { $gte: params.since },
    };

    if (params.senderId) {
      query.sender = new Types.ObjectId(params.senderId);
    }
    if (params.referenceId) {
      query.reference = new Types.ObjectId(params.referenceId);
    }
    if (params.referenceType) {
      query.referenceType = params.referenceType;
    }

    const existing = await NotificationModel.exists(query);
    return existing !== null;
  }

  async deleteByReferences(referenceIds: ReferenceId[]): Promise<void> {
    if (referenceIds.length === 0) {
      return;
    }
    await NotificationModel.deleteMany({
      reference: {
        $in: referenceIds.map((id) => new Types.ObjectId(id)),
      },
    }).exec();
  }

  async deleteByUser(userId: UserId): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    await NotificationModel.deleteMany({
      $or: [{ sender: userObjectId }, { receiver: userObjectId }],
    }).exec();
  }
}

export default MongooseNotificationRepository;
