import { Message } from "@src/domain/entities/Message.entity";
import {
  FindMessagesByConversationParams,
  IMessageRepository,
  MessageListItem,
  MessageSenderReadModel,
} from "@src/domain/interfaces/IMessageRepository";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { MessageMapper } from "@src/infrastructure/mappers/Message.mapper";
import MessageModel, {
  MessageDocumentProps,
} from "@src/infrastructure/persistence/schemas/Message.schema";
import { FilterQuery, Types } from "mongoose";

const SENDER_POPULATE = {
  path: "sender",
  select: "username firstname lastname email image",
  populate: {
    path: "image",
    select: "urls",
  },
};

const PARTNERSHIP_POPULATE = {
  path: "partnership",
  select: "type event place",
  populate: [
    {
      path: "event",
      select: "name description lifecycleStatus image dateRange",
      populate: {
        path: "image",
        select: "urls",
      },
    },
    {
      path: "place",
      select: "location placeCategory followers",
      populate: {
        path: "placeCategory",
        select: "name",
      },
    },
  ],
};

type PopulatedSender = {
  _id: Types.ObjectId;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
};

type LeanMessageDoc = Omit<MessageDocumentProps, "sender"> & {
  _id: Types.ObjectId;
  sender?: Types.ObjectId | PopulatedSender;
  partnership?: unknown;
};

class MongooseMessageRepository implements IMessageRepository {
  async save(message: Message): Promise<MessageId> {
    const document = await MessageModel.create(
      MessageMapper.toPersistence(message)
    );
    return MessageId.from(document._id.toString());
  }

  async findById(id: MessageId): Promise<Message | null> {
    const document = await MessageModel.findById(id).lean<
      MessageDocumentProps & { _id: Types.ObjectId }
    >();
    if (!document) {
      return null;
    }
    return MessageMapper.toDomain(document);
  }

  async findPopulatedById(id: MessageId): Promise<MessageListItem | null> {
    const document = await MessageModel.findById(id)
      .populate(SENDER_POPULATE)
      .lean<LeanMessageDoc>();
    if (!document) {
      return null;
    }
    return this.toListItem(document);
  }

  async findByConversation(
    params: FindMessagesByConversationParams
  ): Promise<MessageListItem[]> {
    const query: FilterQuery<MessageDocumentProps> = {
      conversation: new Types.ObjectId(params.conversationId),
    };
    if (params.senderId) {
      query.sender = new Types.ObjectId(params.senderId);
    }
    if (params.readByUserId) {
      query.readBy = new Types.ObjectId(params.readByUserId);
    }

    const documents = await MessageModel.find(query)
      .populate(SENDER_POPULATE)
      .populate(PARTNERSHIP_POPULATE)
      .sort({ createdAt: 1 })
      .lean<LeanMessageDoc[]>();

    return documents.map((doc) => this.toListItem(doc));
  }

  async update(message: Message): Promise<void> {
    if (!message.id) {
      throw new Error("Cannot update message without id");
    }
    await MessageModel.updateOne(
      { _id: new Types.ObjectId(message.id) },
      { $set: MessageMapper.toPersistence(message) }
    ).exec();
  }

  async delete(id: MessageId): Promise<void> {
    await MessageModel.deleteOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async markConversationAsRead(
    conversationId: ConversationId,
    userId: UserId
  ): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    const unread = await MessageModel.find({
      conversation: new Types.ObjectId(conversationId),
      sender: { $ne: userObjectId },
      readBy: { $nin: [userObjectId] },
    })
      .select("_id")
      .lean();

    if (unread.length === 0) {
      return 0;
    }

    const result = await MessageModel.updateMany(
      {
        _id: { $in: unread.map((doc) => doc._id) },
      },
      { $addToSet: { readBy: userObjectId } }
    );

    return result.modifiedCount;
  }

  async countUnreadInConversation(
    conversationId: ConversationId,
    userId: UserId
  ): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    return MessageModel.countDocuments({
      conversation: new Types.ObjectId(conversationId),
      sender: { $ne: userObjectId },
      readBy: { $nin: [userObjectId] },
    });
  }

  async hasUnreadInConversation(
    conversationId: ConversationId,
    userId: UserId
  ): Promise<boolean> {
    const userObjectId = new Types.ObjectId(userId);
    const unread = await MessageModel.findOne({
      conversation: new Types.ObjectId(conversationId),
      sender: { $ne: userObjectId },
      readBy: { $nin: [userObjectId] },
    })
      .select("_id")
      .lean();
    return unread !== null;
  }

  private toListItem(doc: LeanMessageDoc): MessageListItem {
    return {
      _id: doc._id.toString(),
      conversation: doc.conversation.toString(),
      sender: this.mapSender(doc.sender),
      content: doc.content,
      readBy: (doc.readBy ?? []).map((id) => id.toString()),
      partnership: doc.partnership,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  private mapSender(
    sender: Types.ObjectId | PopulatedSender | undefined
  ): MessageSenderReadModel | string | undefined {
    if (!sender) {
      return undefined;
    }
    if (sender instanceof Types.ObjectId) {
      return sender.toString();
    }
    if (typeof sender === "object" && "_id" in sender) {
      return {
        _id: sender._id.toString(),
        username: sender.username,
        firstname: sender.firstname,
        lastname: sender.lastname,
        email: sender.email,
        image: sender.image,
      };
    }
    return String(sender);
  }
}

export default MongooseMessageRepository;
