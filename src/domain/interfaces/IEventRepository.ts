import { Event } from "@src/domain/entities/Event.entity";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";
import {
  EventDateRange,
  EventPeriod,
} from "@src/domain/value-objects/EventSchedule.vo";
import {
  EventId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface SoftDeleteEventParams {
  deleted: boolean;
  adminId: UserId;
  reason?: string;
}

export interface EventListFilters {
  placeId?: string;
  userId?: string;
  search?: string;
  limit?: number;
  lifecycleStatus?: LifecycleStatus[];
  sortBy?: "createdAt" | "dateRange.firstDate";
  order?: "asc" | "desc";
}

export interface EventInViewFilters {
  ne: number[];
  sw: number[];
  eventCategories?: string[];
  startDate?: string | null;
  endDate?: string | null;
  limit: number;
}

export interface LifecycleEventSlice {
  id: EventId;
  schedule: EventPeriod[];
  dateRange?: EventDateRange;
  lifecycleStatus: LifecycleStatus;
}

export interface AdminEventSummary {
  _id: string;
  name: string;
  status: EventStatus;
  lifecycleStatus: LifecycleStatus;
  deleted: boolean;
  createdAt: Date;
}

export interface IEventRepository {
  save(event: Event): Promise<EventId>;
  findById(id: EventId): Promise<Event | null>;
  update(event: Event): Promise<void>;

  findDetailById(id: EventId): Promise<Record<string, unknown> | null>;
  findList(filters: EventListFilters): Promise<Record<string, unknown>[]>;
  findInView(filters: EventInViewFilters): Promise<Record<string, unknown>[]>;

  findAllForLifecycleUpdate(limit?: number): Promise<LifecycleEventSlice[]>;
  updateLifecycleFields(
    id: EventId,
    fields: { dateRange?: EventDateRange; lifecycleStatus?: LifecycleStatus }
  ): Promise<void>;

  updateRating(id: EventId, rating: number): Promise<void>;
  softDelete(id: EventId, params: SoftDeleteEventParams): Promise<void>;

  findIdsByPlace(placeId: PlaceId): Promise<EventId[]>;
  findIdsByOwner(userId: UserId): Promise<EventId[]>;
  deleteManyByIds(ids: EventId[]): Promise<void>;
  removeCollaborator(userId: UserId): Promise<void>;

  findScheduleById(id: EventId): Promise<EventPeriod[] | null>;
  updateSchedule(id: EventId, schedule: EventPeriod[]): Promise<void>;

  findByAuthorAdmin(userId: UserId, limit?: number): Promise<AdminEventSummary[]>;
  findByPlaceInDateRange(
    placeId: PlaceId,
    start: Date,
    end: Date
  ): Promise<Record<string, unknown>[]>;

  findOwnerId(id: EventId): Promise<UserId | null>;
}
