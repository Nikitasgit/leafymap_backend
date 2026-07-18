import {
  EventCategoryId,
  EventId,
  ImageId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";
import {
  EventDateRange,
  EventPeriod,
  calculateEventStatus,
} from "@src/domain/value-objects/EventSchedule.vo";
import { ValidationError } from "@src/shared/errors";

export interface EventLocation {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface CreateEventParams {
  name: string;
  description: string;
  ownerId: UserId;
  categoryId: EventCategoryId;
  schedule: EventPeriod[];
  placeId?: PlaceId | null;
  location?: EventLocation | null;
  online?: boolean;
  imageId?: ImageId;
  status?: EventStatus;
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}

export interface ReconstituteEventParams {
  id: EventId;
  name: string;
  description: string;
  ownerId: UserId;
  categoryId: EventCategoryId;
  schedule: EventPeriod[];
  dateRange: EventDateRange;
  status: EventStatus;
  lifecycleStatus: LifecycleStatus;
  placeId?: PlaceId | null;
  location?: EventLocation | null;
  online: boolean;
  imageId?: ImageId;
  rating: number;
  isBookable: boolean;
  capacity?: number | null;
  maxSeatsPerBooking: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateEventParams {
  name?: string;
  description?: string;
  categoryId?: EventCategoryId;
  schedule?: EventPeriod[];
  placeId?: PlaceId | null;
  location?: EventLocation | null;
  online?: boolean;
  imageId?: ImageId;
  status?: EventStatus;
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}

export class Event {
  private constructor(
    public readonly id: EventId | null,
    public readonly name: string,
    public readonly description: string,
    public readonly ownerId: UserId,
    public readonly categoryId: EventCategoryId,
    public readonly schedule: EventPeriod[],
    public readonly dateRange: EventDateRange,
    public readonly status: EventStatus,
    public readonly lifecycleStatus: LifecycleStatus,
    public readonly placeId: PlaceId | null | undefined,
    public readonly location: EventLocation | null | undefined,
    public readonly online: boolean,
    public readonly imageId: ImageId | undefined,
    public readonly rating: number,
    public readonly isBookable: boolean,
    public readonly capacity: number | null | undefined,
    public readonly maxSeatsPerBooking: number,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | undefined,
    public readonly deletedBy: UserId | undefined,
    public readonly deleteReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateEventParams): Event {
    const name = Event.assertName(params.name);
    const description = Event.assertDescription(params.description);
    const schedule = Event.assertSchedule(params.schedule);
    const online = params.online ?? false;
    const { placeId, location } = Event.normalizeLocationMode({
      online,
      placeId: params.placeId,
      location: params.location,
    });
    const isBookable = params.isBookable ?? false;
    const maxSeatsPerBooking = params.maxSeatsPerBooking ?? 1;
    const capacity = params.capacity ?? null;
    Event.assertBookingCapacity(isBookable, capacity, maxSeatsPerBooking);

    const { dateRange, lifecycleStatus } = calculateEventStatus(schedule);
    const now = new Date();

    return new Event(
      null,
      name,
      description,
      params.ownerId,
      params.categoryId,
      schedule,
      dateRange,
      params.status ?? "available",
      lifecycleStatus,
      placeId,
      location,
      online,
      params.imageId,
      0,
      isBookable,
      capacity,
      maxSeatsPerBooking,
      false,
      undefined,
      undefined,
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteEventParams): Event {
    return new Event(
      params.id,
      params.name,
      params.description,
      params.ownerId,
      params.categoryId,
      params.schedule,
      params.dateRange,
      params.status,
      params.lifecycleStatus,
      params.placeId,
      params.location,
      params.online,
      params.imageId,
      params.rating,
      params.isBookable,
      params.capacity,
      params.maxSeatsPerBooking,
      params.deleted,
      params.deletedAt,
      params.deletedBy,
      params.deleteReason,
      params.createdAt,
      params.updatedAt
    );
  }

  update(params: UpdateEventParams): Event {
    const online = params.online ?? this.online;
    const hasLocationUpdate =
      params.online !== undefined ||
      params.placeId !== undefined ||
      params.location !== undefined;

    const { placeId, location } = hasLocationUpdate
      ? Event.normalizeLocationMode({
          online,
          placeId:
            params.placeId !== undefined ? params.placeId : this.placeId,
          location:
            params.location !== undefined ? params.location : this.location,
        })
      : { placeId: this.placeId, location: this.location };

    const schedule =
      params.schedule !== undefined
        ? Event.assertSchedule(params.schedule)
        : this.schedule;
    const { dateRange, lifecycleStatus } =
      params.schedule !== undefined
        ? calculateEventStatus(schedule)
        : { dateRange: this.dateRange, lifecycleStatus: this.lifecycleStatus };

    const isBookable = params.isBookable ?? this.isBookable;
    const maxSeatsPerBooking =
      params.maxSeatsPerBooking ?? this.maxSeatsPerBooking;
    const capacity =
      params.capacity !== undefined ? params.capacity : this.capacity;
    Event.assertBookingCapacity(isBookable, capacity, maxSeatsPerBooking);

    return new Event(
      this.id,
      params.name !== undefined ? Event.assertName(params.name) : this.name,
      params.description !== undefined
        ? Event.assertDescription(params.description)
        : this.description,
      this.ownerId,
      params.categoryId ?? this.categoryId,
      schedule,
      dateRange,
      params.status ?? this.status,
      lifecycleStatus,
      placeId,
      location,
      online,
      params.imageId !== undefined ? params.imageId : this.imageId,
      this.rating,
      isBookable,
      capacity,
      maxSeatsPerBooking,
      this.deleted,
      this.deletedAt,
      this.deletedBy,
      this.deleteReason,
      this.createdAt,
      new Date()
    );
  }

  withLifecycle(
    dateRange: EventDateRange,
    lifecycleStatus: LifecycleStatus
  ): Event {
    return new Event(
      this.id,
      this.name,
      this.description,
      this.ownerId,
      this.categoryId,
      this.schedule,
      dateRange,
      this.status,
      lifecycleStatus,
      this.placeId,
      this.location,
      this.online,
      this.imageId,
      this.rating,
      this.isBookable,
      this.capacity,
      this.maxSeatsPerBooking,
      this.deleted,
      this.deletedAt,
      this.deletedBy,
      this.deleteReason,
      this.createdAt,
      new Date()
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.ownerId === userId;
  }

  private static assertName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length < 4 || trimmed.length > 40) {
      throw new ValidationError({
        name: "Name must be between 4 and 40 characters",
      });
    }
    return trimmed;
  }

  private static assertDescription(description: string): string {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      throw new ValidationError({ description: "Description is required" });
    }
    return trimmed;
  }

  private static assertSchedule(schedule: EventPeriod[]): EventPeriod[] {
    if (!schedule || schedule.length === 0) {
      throw new ValidationError({
        schedule: "Schedule must contain at least one period",
      });
    }
    return schedule;
  }

  private static normalizeLocationMode(params: {
    online: boolean;
    placeId?: PlaceId | null;
    location?: EventLocation | null;
  }): {
    placeId: PlaceId | null | undefined;
    location: EventLocation | null | undefined;
  } {
    if (params.online) {
      return { placeId: null, location: null };
    }
    if (!params.placeId && !params.location) {
      throw new ValidationError({
        location: "A place or location is required for offline events",
      });
    }
    return { placeId: params.placeId, location: params.location };
  }

  private static assertBookingCapacity(
    isBookable: boolean,
    capacity: number | null | undefined,
    maxSeatsPerBooking: number
  ): void {
    if (maxSeatsPerBooking < 1) {
      throw new ValidationError({
        maxSeatsPerBooking: "maxSeatsPerBooking must be at least 1",
      });
    }
    if (!isBookable) {
      return;
    }
    if (typeof capacity === "number" && capacity < maxSeatsPerBooking) {
      throw new ValidationError({
        maxSeatsPerBooking:
          "maxSeatsPerBooking cannot exceed total capacity",
      });
    }
  }
}
