import { Types } from "mongoose";
import { IUser } from "./user";

export interface IPartnership {
  _id: Types.ObjectId;
  initiator: Types.ObjectId | Partial<IUser>;
  collaborator: Types.ObjectId | Partial<IUser>;
  status: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted: boolean;
}

export interface IPartnershipPopulated
  extends Omit<IPartnership, "initiator" | "collaborator"> {
  initiator: Partial<IUser> & {
    username: string;
  };
  collaborator: Partial<IUser>;
}
