import { IMessage } from "../models/message";
import { Types } from "mongoose";

export interface MessageFilters {
  conversation?: string;
  sender?: string;
  isRead?: boolean;
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
  updateOne(id: string, update: Partial<IMessage>): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
