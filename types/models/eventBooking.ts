import { Types } from "mongoose";
import { IUser } from "./user";
import { IEvent } from "./event";

export interface IEventBooking {
  _id: Types.ObjectId;
  event: Types.ObjectId | Partial<IEvent>;
  user: Types.ObjectId | Partial<IUser>;
  seats: number;
  status: "confirmed" | "cancelled";
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

