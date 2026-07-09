import { IPartnership } from "../models/partnership";
import { Types, FilterQuery } from "mongoose";

export interface PartnershipFilters {
  _id?: string;
  initiator?: string;
  collaborator?: string;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted?: boolean;
  $or?: Array<{ initiator?: string; collaborator?: string }>;
  $and?: FilterQuery<IPartnership>[];
  [key: string]: unknown;
}

export interface PartnershipUserFilters {
  userId: string;
  asCollaborator?: boolean;
  asInitiator?: boolean;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  currentUserId?: string;
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
  findAllForUser<K extends keyof IPartnership>(params: {
    filters: PartnershipUserFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IPartnership, K>[]>;
  updateOne(id: string, update: Partial<IPartnership>): Promise<void>;
  updateMany(
    filters: PartnershipFilters,
    update: Partial<IPartnership>
  ): Promise<number>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: PartnershipFilters): Promise<void>;
}
