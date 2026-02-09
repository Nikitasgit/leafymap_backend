import Conversation from "../models/Conversation";
import { IConversation } from "@/types/models/conversation";
import {
  IConversationRepository,
  ConversationFilters,
} from "@/types/repositories/conversation.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class ConversationRepository implements IConversationRepository {
  private buildQuery(
    filters?: ConversationFilters
  ): FilterQuery<IConversation> {
    const query: FilterQuery<IConversation> = {};

    if (!filters) return query;

    if (filters._id) {
      query._id = new Types.ObjectId(filters._id);
    }

    if (filters.participants) {
      if (typeof filters.participants === "string") {
        query.participants = new Types.ObjectId(filters.participants);
      } else if ("$in" in filters.participants) {
        query.participants = {
          $in: filters.participants.$in.map((id) => new Types.ObjectId(id)),
        };
      } else if ("$all" in filters.participants) {
        query.participants = {
          $all: filters.participants.$all.map((id) => new Types.ObjectId(id)),
        };
      }
    }

    Object.keys(filters).forEach((key) => {
      if (!["_id", "participants"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(conversation: Partial<IConversation>): Promise<Types.ObjectId> {
    const newConversation = await Conversation.create(conversation);
    return newConversation._id;
  }

  async findById(
    id: string,
    project?: (keyof IConversation | string)[]
  ): Promise<IConversation | null> {
    let query = Conversation.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig);
    }

    const conversation = await query.lean();
    return conversation as IConversation | null;
  }

  async findOne(
    filter: Partial<IConversation> | FilterQuery<IConversation>,
    project?: (keyof IConversation | string)[]
  ): Promise<IConversation | null> {
    const queryFilter = this.buildQuery(filter as any);
    let query = Conversation.findOne(queryFilter);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig);
    }

    const conversation = await query.lean();
    return conversation as IConversation | null;
  }

  async findAll<K extends keyof IConversation>(params: {
    filters?: ConversationFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IConversation, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Conversation.find(query);

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
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      );
    }

    const conversations = await mongooseQuery.lean();
    return conversations as unknown as Pick<IConversation, K>[];
  }

  async updateOne(id: string, update: Partial<IConversation>): Promise<void> {
    await Conversation.updateOne({ _id: id }, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Conversation.deleteOne({ _id: id }).exec();
  }
}

export default ConversationRepository;
