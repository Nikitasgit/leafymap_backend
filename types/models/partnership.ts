import { Types } from "mongoose";
import { IUser } from "./user";
import { IEvent } from "./event";
import { IPlace } from "./place";

export interface IPartnership {
  _id: Types.ObjectId;
  type: "place" | "event";
  place: Types.ObjectId | Partial<IPlace>;
  event?: Types.ObjectId | Partial<IEvent>;
  initiator: Types.ObjectId | Partial<IUser>;
  collaborator: Types.ObjectId | Partial<IUser>;
  status: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted: boolean;
}
