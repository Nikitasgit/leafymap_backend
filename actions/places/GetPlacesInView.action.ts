import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IPlace } from "@/types/models/place";
import { parseJson } from "@/utils/jsonHandlers";
import { Types } from "mongoose";

export const MAX_IDS = 500;
export const MAX_LIMIT_BOUNDS = 100;

export interface GetPlacesInViewInput {
  ne?: number[];
  sw?: number[];
  ids?: string[];
  /** JSON-encoded client-side filter string */
  clientFilters?: string;
  limit?: number;
}

export interface IGetPlacesInViewAction {
  execute(params: {
    filters: GetPlacesInViewInput;
  }): Promise<Partial<IPlace>[]>;
}

interface ClientFilters {
  placeTypes: string[];
  placeCategories: string[];
  minRating?: number | null;
  userCategoryIds?: string[];
  productCategoryIds?: string[];
}

const CLIENT_FILTERS_DEFAULTS: ClientFilters = {
  placeTypes: [],
  placeCategories: [],
};

const toObjectIds = (ids: string[]) => ids.map((id) => new Types.ObjectId(id));

class GetPlacesInViewAction implements IGetPlacesInViewAction {
  constructor(private placeRepository: IPlaceRepository) {}

  /**
   * Builds a single aggregation pipeline that:
   *  1. Narrows by geo bounds / IDs (indexed)
   *  2. Applies simple field filters (placeCategory, rating)
   *  3. Applies type filters through PlaceCategory.types
   *  4. Conditionally $lookup users   — only on the geo-narrowed set
   *  5. Conditionally $lookup products — only on the geo-narrowed set
   *  6. Limits, then populates display fields (placeCategory.name, user.username)
   */
  private buildPipeline(
    input: GetPlacesInViewInput,
    client: ClientFilters,
    limit: number
  ): unknown[] {
    const {
      placeTypes,
      placeCategories,
      minRating,
      userCategoryIds = [],
      productCategoryIds = [],
    } = client;

    const pipeline: Record<string, unknown>[] = [];

    // ── 1. Base filter (geo bounds or explicit IDs) ──
    if (input.ids?.length) {
      pipeline.push({
        $match: { _id: { $in: toObjectIds(input.ids) }, deleted: { $ne: true } },
      });
    } else {
      pipeline.push({
        $match: {
          deleted: { $ne: true },
          location: {
            $geoWithin: { $box: [input.sw!, input.ne!] },
          },
        },
      });
    }

    // ── 2. Simple field filters (all uniform: empty = no filter) ──
    if (placeCategories.length > 0) {
      pipeline.push({
        $match: { placeCategory: { $in: toObjectIds(placeCategories) } },
      });
    }

    if (placeTypes.length > 0) {
      pipeline.push(
        {
          $lookup: {
            from: "placecategories",
            localField: "placeCategory",
            foreignField: "_id",
            pipeline: [{ $project: { types: 1 } }],
            as: "_placeTypeFilterCategory",
          },
        },
        {
          $unwind: {
            path: "$_placeTypeFilterCategory",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "_placeTypeFilterCategory.types": {
              $in: toObjectIds(placeTypes),
            },
          },
        }
      );
    }

    if (minRating != null) {
      pipeline.push({ $match: { rating: { $gte: minRating } } });
    }

    // ── 3. User category filter ──
    // $lookup joins only the ~N places surviving the geo + field stages above,
    // NOT the entire users collection.
    if (userCategoryIds.length > 0) {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "_userDoc",
          },
        },
        { $unwind: "$_userDoc" },
        {
          $match: {
            "_userDoc.userCategory": {
              $in: toObjectIds(userCategoryIds),
            },
          },
        }
      );
    }

    // ── 4. Product category filter ──
    if (productCategoryIds.length > 0) {
      pipeline.push(
        {
          $lookup: {
            from: "products",
            localField: "user",
            foreignField: "user",
            as: "_userProducts",
          },
        },
        {
          $match: {
            "_userProducts.productCategory": {
              $in: toObjectIds(productCategoryIds),
            },
          },
        }
      );
    }

    // ── 5. Limit before display lookups ──
    pipeline.push({ $limit: limit });

    // ── 6. Populate display fields (placeCategory.name, user.username) ──
    pipeline.push(
      {
        $lookup: {
          from: "placecategories",
          localField: "placeCategory",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1 } }],
          as: "_placeCat",
        },
      },
      {
        $unwind: { path: "$_placeCat", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1 } }],
          as: "_userDisplay",
        },
      },
      {
        $unwind: {
          path: "$_userDisplay",
          preserveNullAndEmptyArrays: true,
        },
      }
    );

    // ── 7. Project final shape (matches the old populate output) ──
    pipeline.push({
      $project: {
        location: 1,
        rating: 1,
        placeCategory: "$_placeCat",
        user: "$_userDisplay",
      },
    });

    return pipeline;
  }

  async execute({
    filters,
  }: {
    filters: GetPlacesInViewInput;
  }): Promise<Partial<IPlace>[]> {
    const clientFilters = parseJson<ClientFilters>(
      filters.clientFilters,
      CLIENT_FILTERS_DEFAULTS
    );

    const limit = filters.ids?.length
      ? Math.min(filters.limit ?? filters.ids.length, MAX_IDS)
      : Math.min(filters.limit ?? 20, MAX_LIMIT_BOUNDS);

    const pipeline = this.buildPipeline(filters, clientFilters, limit);

    return this.placeRepository.aggregate<Partial<IPlace>>(pipeline);
  }
}

export default GetPlacesInViewAction;
