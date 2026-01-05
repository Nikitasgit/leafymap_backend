import { IEvent } from "../../types/models/event";
import { Types } from "mongoose";

export interface EventFilters {
  place?: string | { $in: string[] };
  _id?: string;
  deleted?: boolean;
  status?:
    | "cancelled"
    | "full"
    | "available"
    | { $ne: "cancelled" | "full" | "available" };
  dateRange?: {
    start: Date;
    end: Date;
  };
  [key: string]: unknown;
}

export interface IEventRepository {
  create(event: Partial<IEvent>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IEvent | string)[]
  ): Promise<IEvent | null>;
  findAll<K extends keyof IEvent>(params: {
    filters?: EventFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEvent, K>[]>;
  updateOne(id: string, update: Partial<IEvent>): Promise<void>;
  updateMany(filters: EventFilters, update: Partial<IEvent>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: EventFilters): Promise<void>;
}
