import { Types } from "mongoose";

export interface ICollaborator {
  user: Types.ObjectId;
  status?: "pending" | "accepted" | "refused";
}
