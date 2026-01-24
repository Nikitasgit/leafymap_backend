import { IConversation } from "../models/conversation";
import { Types, FilterQuery } from "mongoose";

export interface ConversationFilters {
  _id?: string;
  participants?: string | { $in: string[] } | { $all: string[] };
  [key: string]: unknown;
}

export interface IConversationRepository {
  create(conversation: Partial<IConversation>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IConversation | string)[]
  ): Promise<IConversation | null>;
  findOne(
    filter: Partial<IConversation> | FilterQuery<IConversation>,
    project?: (keyof IConversation | string)[]
  ): Promise<IConversation | null>;
  findAll<K extends keyof IConversation>(params: {
    filters?: ConversationFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IConversation, K>[]>;
  updateOne(id: string, update: Partial<IConversation>): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
