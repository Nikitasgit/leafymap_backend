import { IEventBooking } from "../models/eventBooking";
import { Types } from "mongoose";

export interface EventBookingFilters {
  _id?: string;
  event?: string;
  user?: string;
  status?: "confirmed" | "cancelled";
  deleted?: boolean;
  [key: string]: unknown;
}

export interface IEventBookingRepository {
  create(eventBooking: Partial<IEventBooking>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IEventBooking | string)[]
  ): Promise<IEventBooking | null>;
  findOne(
    filter: Partial<IEventBooking>,
    project?: (keyof IEventBooking | string)[]
  ): Promise<IEventBooking | null>;
  findAll<K extends keyof IEventBooking>(params: {
    filters?: EventBookingFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventBooking, K>[]>;
  updateOne(id: string, update: Partial<IEventBooking>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  sumConfirmedSeats(eventId: string, excludeBookingId?: string): Promise<number>;
}
