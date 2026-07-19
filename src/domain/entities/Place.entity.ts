import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import {
  PlaceCustomDate,
  PlaceDefaultSchedule,
} from "@src/domain/value-objects/PlaceSchedule.vo";

export interface CreatePlaceParams {
  userId: UserId;
  location: PlaceLocation;
  placeCategoryId: PlaceCategoryId;
  defaultSchedule?: PlaceDefaultSchedule;
  customDates?: PlaceCustomDate[];
}

export interface ReconstitutePlaceParams {
  id: PlaceId;
  userId: UserId;
  location: PlaceLocation;
  placeCategoryId: PlaceCategoryId;
  defaultSchedule: PlaceDefaultSchedule;
  customDates: PlaceCustomDate[];
  rating: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePlaceDetailsParams {
  location?: PlaceLocation;
  placeCategoryId?: PlaceCategoryId;
  defaultSchedule?: PlaceDefaultSchedule;
  customDates?: PlaceCustomDate[];
}

export class Place {
  private constructor(
    public readonly id: PlaceId | null,
    public readonly userId: UserId,
    public readonly location: PlaceLocation,
    public readonly placeCategoryId: PlaceCategoryId,
    public readonly defaultSchedule: PlaceDefaultSchedule,
    public readonly customDates: PlaceCustomDate[],
    public readonly rating: number,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | undefined,
    public readonly deletedBy: UserId | undefined,
    public readonly deleteReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreatePlaceParams): Place {
    const now = new Date();
    return new Place(
      null,
      params.userId,
      params.location,
      params.placeCategoryId,
      params.defaultSchedule ?? ({} as PlaceDefaultSchedule),
      params.customDates ?? [],
      0,
      false,
      undefined,
      undefined,
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstitutePlaceParams): Place {
    return new Place(
      params.id,
      params.userId,
      params.location,
      params.placeCategoryId,
      params.defaultSchedule,
      params.customDates,
      params.rating,
      params.deleted,
      params.deletedAt,
      params.deletedBy,
      params.deleteReason,
      params.createdAt,
      params.updatedAt
    );
  }

  updateDetails(params: UpdatePlaceDetailsParams): Place {
    return new Place(
      this.id,
      this.userId,
      params.location ?? this.location,
      params.placeCategoryId ?? this.placeCategoryId,
      params.defaultSchedule ?? this.defaultSchedule,
      params.customDates ?? this.customDates,
      this.rating,
      this.deleted,
      this.deletedAt,
      this.deletedBy,
      this.deleteReason,
      this.createdAt,
      new Date()
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.userId === userId;
  }
}
