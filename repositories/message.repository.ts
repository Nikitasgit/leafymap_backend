import Message from "../models/Message";
import { IMessage } from "@/types/models/message";
import {
  IMessageRepository,
  MessageFilters,
} from "@/types/repositories/message.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class MessageRepository implements IMessageRepository {
  private buildQuery(filters?: MessageFilters): FilterQuery<IMessage> {
    const query: FilterQuery<IMessage> = {};

    if (!filters) return query;

    if (filters.conversation) {
      query.conversation = new Types.ObjectId(filters.conversation);
    }
    if (filters.sender) {
      query.sender = new Types.ObjectId(filters.sender);
    }
    if (filters.isRead !== undefined) {
      query.isRead = filters.isRead;
    }
    if (filters._id) {
      query._id = {
        $in: filters._id.$in.map((id) => new Types.ObjectId(id)),
      };
    }

    Object.keys(filters).forEach((key) => {
      if (!["conversation", "sender", "isRead", "_id"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(message: Partial<IMessage>): Promise<Types.ObjectId> {
    const newMessage = new Message(message);
    await newMessage.save();
    return newMessage._id;
  }

  async findById(
    id: string,
    project?: (keyof IMessage | string)[]
  ): Promise<IMessage | null> {
    let query = Message.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig);
    }

    const message = await query.lean();
    return message as IMessage | null;
  }

  async findAll<K extends keyof IMessage>(params: {
    filters?: MessageFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IMessage, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Message.find(query);

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

    const messages = await mongooseQuery.lean();
    return messages as Pick<IMessage, K>[];
  }

  async updateOne(id: string, update: Partial<IMessage>): Promise<void> {
    await Message.updateOne({ _id: id }, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Message.deleteOne({ _id: id }).exec();
  }
}

export default MessageRepository;
