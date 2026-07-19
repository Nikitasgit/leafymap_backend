import { Place } from "@src/domain/entities/Place.entity";
import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface PlaceSoftDeleteUpdate {
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
}

export interface PlaceListFilters {
  placeCategoryId?: PlaceCategoryId;
  limit?: number;
}

export interface PlacesInViewClientFilters {
  placeTypes: string[];
  placeCategories: string[];
  minRating?: number | null;
  userCategoryIds?: string[];
  productCategoryIds?: string[];
}

export interface PlacesInViewQuery {
  ne?: number[];
  sw?: number[];
  ids?: string[];
  clientFilters: PlacesInViewClientFilters;
  limit: number;
}

export interface IPlaceRepository {
  save(place: Place): Promise<PlaceId>;
  update(place: Place): Promise<void>;
  findById(id: PlaceId): Promise<Place | null>;
  findDetailsById(id: PlaceId): Promise<Record<string, unknown> | null>;
  findList(filters: PlaceListFilters): Promise<Record<string, unknown>[]>;
  findInView(query: PlacesInViewQuery): Promise<Record<string, unknown>[]>;
  findIdsByUserId(userId: UserId): Promise<PlaceId[]>;
  findAdminSummariesByUserId(
    userId: UserId,
    limit: number
  ): Promise<Record<string, unknown>[]>;
  updateRating(id: PlaceId, rating: number): Promise<void>;
  deleteOne(id: PlaceId): Promise<void>;
  softDelete(id: PlaceId, update: PlaceSoftDeleteUpdate): Promise<void>;
}
