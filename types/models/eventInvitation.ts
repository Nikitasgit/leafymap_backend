import { Types } from "mongoose";
import { IUser } from "./user";
import { IEvent } from "./event";

type Populated<T> = T | Types.ObjectId;
export interface IEventInvitation {
  _id: Types.ObjectId;
  event: Types.ObjectId | Partial<IEvent>;
  initiator: Types.ObjectId | Partial<IUser>;
  collaborator: Types.ObjectId | Partial<IUser>;
  status: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted: boolean;
}

export interface IEventInvitationPopulated
  extends Omit<IEventInvitation, "event" | "initiator" | "collaborator"> {
  event: Partial<IEvent>;
  initiator: Partial<IUser> & {
    username: string;
  };
  collaborator: Partial<IUser>;
}
