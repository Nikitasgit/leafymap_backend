import { Conversation } from "@src/domain/entities/Conversation.entity";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { ConversationInboxItem } from "@src/domain/read-models/conversation.read-models";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ConversationMapper } from "@src/infrastructure/mappers/Conversation.mapper";
import ConversationModel, {
  ConversationDocumentProps,
} from "@src/infrastructure/persistence/schemas/Conversation.schema";
import MessageModel from "@src/infrastructure/persistence/schemas/Message.schema";
import { ConversationReadMapper } from "@src/infrastructure/read-mappers/Conversation.read-mapper";
import { Types } from "mongoose";

const PARTICIPANTS_POPULATE = {
  path: "participants",
  select: "username firstname lastname email image",
  populate: {
    path: "image",
    select: "urls",
  },
};

const LAST_MESSAGE_POPULATE = {
  path: "lastMessage",
  select: "content partnership createdAt",
  populate: {
    path: "partnership",
    select: "type",
  },
};

type PopulatedParticipant = {
  _id: Types.ObjectId;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      thumbnail?: string;
      medium?: string;
      original?: string;
    };
  };
};

type PopulatedLastMessage = {
  _id: Types.ObjectId;
  content?: string;
  partnership?:
    | Types.ObjectId
    | {
        type?: "place" | "event";
      };
  createdAt?: Date;
};

type LeanConversationDoc = Omit<
  ConversationDocumentProps,
  "participants" | "lastMessage"
> & {
  _id: Types.ObjectId;
  participants: Array<Types.ObjectId | PopulatedParticipant>;
  lastMessage?: Types.ObjectId | PopulatedLastMessage | null;
};

class MongooseConversationRepository implements IConversationRepository {
  async save(conversation: Conversation): Promise<ConversationId> {
    const document = await ConversationModel.create(
      ConversationMapper.toPersistence(conversation)
    );
    return ConversationId.from(document._id.toString());
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    const document = await ConversationModel.findById(id).lean<
      ConversationDocumentProps & { _id: Types.ObjectId }
    >();
    if (!document) {
      return null;
    }
    return ConversationMapper.toDomain(document);
  }

  async findBetweenUsers(
    userId: UserId,
    otherUserId: UserId
  ): Promise<Conversation | null> {
    const document = await ConversationModel.findOne({
      participants: {
        $all: [new Types.ObjectId(userId), new Types.ObjectId(otherUserId)],
      },
    }).lean<ConversationDocumentProps & { _id: Types.ObjectId }>();

    if (!document) {
      return null;
    }
    return ConversationMapper.toDomain(document);
  }

  async findIdsForUser(userId: UserId): Promise<ConversationId[]> {
    const documents = await ConversationModel.find({
      participants: new Types.ObjectId(userId),
    })
      .select("_id")
      .lean<{ _id: Types.ObjectId }[]>();

    return documents.map((doc) => ConversationId.from(doc._id.toString()));
  }

  async findInboxForUser(userId: UserId): Promise<ConversationInboxItem[]> {
    const documents = await ConversationModel.find({
      participants: new Types.ObjectId(userId),
    })
      .populate(PARTICIPANTS_POPULATE)
      .populate(LAST_MESSAGE_POPULATE)
      .sort({ updatedAt: -1 })
      .lean<LeanConversationDoc[]>();

    const userObjectId = new Types.ObjectId(userId);
    const result: ConversationInboxItem[] = [];

    for (const doc of documents) {
      const unreadCount = await MessageModel.countDocuments({
        conversation: doc._id,
        sender: { $ne: userObjectId },
        readBy: { $nin: [userObjectId] },
      });

      result.push(ConversationReadMapper.toInboxItem(doc, unreadCount));
    }

    return result;
  }

  async updateLastMessage(
    conversationId: ConversationId,
    messageId: MessageId
  ): Promise<void> {
    await ConversationModel.updateOne(
      { _id: new Types.ObjectId(conversationId) },
      { $set: { lastMessage: new Types.ObjectId(messageId) } }
    ).exec();
  }

}

export default MongooseConversationRepository;
