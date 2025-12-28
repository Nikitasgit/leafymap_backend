import Place from "../../models/Place";
import { IPlace } from "../../types/models/place";
import { IPlaceRepository, PlaceFilters } from "./IPlaceRepository";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "../utils/PopulateParser";

class MongoosePlaceRepository implements IPlaceRepository {
  private buildQuery(filters?: PlaceFilters): FilterQuery<IPlace> {
    const query: FilterQuery<IPlace> = {};

    if (!filters) return query;

    if (filters._id) {
      if (typeof filters._id === "string") {
        query._id = new Types.ObjectId(filters._id);
      } else if ("$in" in filters._id) {
        query._id = {
          $in: filters._id.$in.map((id) => new Types.ObjectId(id)),
        };
      }
    }
    if (filters.user) {
      query.user = new Types.ObjectId(filters.user);
    }
    if (filters.placeCategory) {
      // Handle $in operator for placeCategory
      if (
        typeof filters.placeCategory === "object" &&
        "$in" in filters.placeCategory
      ) {
        query.placeCategory = {
          $in: (filters.placeCategory.$in as string[]).map(
            (id) => new Types.ObjectId(id)
          ),
        };
      } else {
        query.placeCategory = new Types.ObjectId(filters.placeCategory);
      }
    }
    if (filters.placeType) {
      query.placeType = filters.placeType;
    }
    if (typeof filters.active === "boolean") {
      query.active = filters.active;
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }
    if (filters.name) {
      query.name = filters.name;
    }
    if (filters.location) {
      query.location = filters.location;
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "_id",
          "user",
          "placeCategory",
          "placeType",
          "active",
          "deleted",
          "name",
          "location",
        ].includes(key)
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(place: Partial<IPlace>): Promise<Types.ObjectId> {
    const newPlace = new Place(place);
    await newPlace.save();
    return newPlace._id;
  }

  async findById(
    id: string,
    project?: (keyof IPlace | string)[]
  ): Promise<IPlace | null> {
    let query = Place.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    const place = await query.lean();
    return place as IPlace | null;
  }

  async findAll<K extends keyof IPlace>(params: {
    filters?: PlaceFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IPlace, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Place.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as typeof mongooseQuery;
    }

    const places = await mongooseQuery.lean();
    return places as Pick<IPlace, K>[];
  }

  async updateOne(id: string, update: Partial<IPlace>): Promise<void> {
    await Place.findByIdAndUpdate(id, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Place.findByIdAndDelete(id).exec();
  }

  async deleteMany(filters: PlaceFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await Place.deleteMany(query).exec();
  }
}

export default MongoosePlaceRepository;
