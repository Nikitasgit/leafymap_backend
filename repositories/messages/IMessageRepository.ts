import { IMessage, MessageReferenceType } from "../../types/models/message";
import { Types } from "mongoose";

export interface MessageFilters {
  reference?: string;
  referenceType?: MessageReferenceType;
  author?: string;
  _id?: { $in: string[] };
  [key: string]: any;
}

export interface IMessageRepository {
  create(message: Partial<IMessage>): Promise<Types.ObjectId>;
  findById(id: string, project?: (keyof IMessage)[]): Promise<IMessage | null>;
  findAll<K extends keyof IMessage>(params: {
    filters?: MessageFilters;
    project: K[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IMessage, K>[]>;
  findAllById(ids: string[], project?: (keyof IMessage)[]): Promise<IMessage[]>;
  updateOne(id: string, update: Partial<IMessage>): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
