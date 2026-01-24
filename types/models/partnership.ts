import { Types } from "mongoose";
import { IUser } from "./user";
import { IEvent } from "./event";
import { IPlace } from "./place";

type Populated<T> = T | Types.ObjectId;
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

export interface IPartnershipPopulated
  extends Omit<IPartnership, "place" | "event" | "initiator" | "collaborator"> {
  place: Partial<IPlace> & {
    location: {
      label: string;
    };
  };
  event?: Partial<IEvent>;
  initiator: Partial<IUser> & {
    username: string;
  };
  collaborator: Partial<IUser>;
}
