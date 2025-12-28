import { IPlace, PlaceType } from "../../types/models/place";
import { Types } from "mongoose";

export interface PlaceFilters {
  _id?: string | { $in: string[] };
  user?: string;
  placeCategory?: string | { $in: string[] };
  placeType?: PlaceType | { $in: PlaceType[] };
  active?: boolean;
  deleted?: boolean;
  name?: { $regex: string; $options: string };
  location?: {
    $geoWithin: {
      $box: [[number, number], [number, number]];
    };
  };
  [key: string]: unknown;
}

export interface IPlaceRepository {
  create(place: Partial<IPlace>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IPlace | string)[]
  ): Promise<IPlace | null>;
  findAll<K extends keyof IPlace>(params: {
    filters?: PlaceFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IPlace, K>[]>;
  updateOne(id: string, update: Partial<IPlace>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: PlaceFilters): Promise<void>;
}
