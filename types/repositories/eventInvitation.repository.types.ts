import { IEventInvitation } from "../models/eventInvitation";
import { Types, FilterQuery } from "mongoose";

export interface EventInvitationFilters {
  _id?: string;
  event?: string;
  eventIn?: string[];
  initiator?: string;
  collaborator?: string;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  deleted?: boolean;
  $or?: Array<{
    initiator?: string;
    collaborator?: string;
    status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
  }>;
  $and?: FilterQuery<IEventInvitation>[];
  [key: string]: unknown;
}

export interface EventInvitationUserFilters {
  userId: string;
  asCollaborator?: boolean;
  onlyAccepted?: boolean;
  onlyPending?: boolean;
  currentUserId?: string;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
}

export interface IEventInvitationRepository {
  create(eventInvitation: Partial<IEventInvitation>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IEventInvitation | string)[]
  ): Promise<IEventInvitation | null>;
  findOne(
    filter: Partial<IEventInvitation>,
    project?: (keyof IEventInvitation | string)[]
  ): Promise<IEventInvitation | null>;
  findAll<K extends keyof IEventInvitation>(params: {
    filters?: EventInvitationFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventInvitation, K>[]>;
  findAllForUser<K extends keyof IEventInvitation>(params: {
    filters: EventInvitationUserFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IEventInvitation, K>[]>;
  updateOne(id: string, update: Partial<IEventInvitation>): Promise<void>;
  updateMany(
    filters: EventInvitationFilters,
    update: Partial<IEventInvitation>
  ): Promise<number>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: EventInvitationFilters): Promise<void>;
}
