import { IPartnership } from "../models/partnership";
import { Types } from "mongoose";

export interface PartnershipFilters {
  _id?: string;
  place?: string;
  event?: string;
  initiator?: string;
  collaborator?: string;
  type?: "place" | "event";
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted?: boolean;
  $or?: Array<{ initiator?: string; collaborator?: string }>;
  [key: string]: unknown;
}

export interface IPartnershipRepository {
  create(partnership: Partial<IPartnership>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IPartnership | string)[]
  ): Promise<IPartnership | null>;
  findOne(
    filter: Partial<IPartnership>,
    project?: (keyof IPartnership | string)[]
  ): Promise<IPartnership | null>;
  findAll<K extends keyof IPartnership>(params: {
    filters?: PartnershipFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IPartnership, K>[]>;
  updateOne(id: string, update: Partial<IPartnership>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: PartnershipFilters): Promise<void>;
}
