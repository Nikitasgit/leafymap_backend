import { IMessage } from "../models/message";
import { Types } from "mongoose";

export interface MessageFilters {
  conversation?: string;
  sender?: string | { $ne: Types.ObjectId } | { $in: string[] };
  readBy?: string | { $ne: Types.ObjectId } | { $nin: Types.ObjectId[] } | { $in: string[] };
  _id?: { $in: string[] };
  [key: string]: unknown;
}

export interface IMessageRepository {
  create(message: Partial<IMessage>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IMessage | string)[]
  ): Promise<IMessage | null>;
  findAll<K extends keyof IMessage>(params: {
    filters?: MessageFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IMessage, K>[]>;
  countAll(params: {
    filters?: MessageFilters;
  }): Promise<number>;
  findOne(filters: MessageFilters): Promise<IMessage | null>;
  updateOne(id: string, update: Partial<IMessage>): Promise<void>;
  markAsReadByUser(messageId: string, userId: string): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
