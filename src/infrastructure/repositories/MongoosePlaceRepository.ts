import { Place } from "@src/domain/entities/Place.entity";
import {
  IPlaceRepository,
  PlaceListFilters,
  PlaceSoftDeleteUpdate,
  PlacesInViewQuery,
} from "@src/domain/interfaces/IPlaceRepository";
import {
  PlaceDetailsReadModel,
  PlaceListItemReadModel,
} from "@src/domain/read-models/place.read-models";
import {
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceMapper } from "@src/infrastructure/mappers/Place.mapper";
import PlaceModel, {
  PlaceDocumentProps,
} from "@src/infrastructure/persistence/schemas/Place.schema";
import { PlaceReadMapper } from "@src/infrastructure/read-mappers/Place.read-mapper";
import { FilterQuery, PipelineStage, Types } from "mongoose";

type PlaceDocumentWithId = PlaceDocumentProps & { _id: Types.ObjectId };

const PLACE_DETAILS_POPULATE = [
  { path: "placeCategory", select: "name" },
  {
    path: "user",
    select:
      "description username website firstname lastname image.urls userCategory",
    populate: {
      path: "userCategory",
      select: "name type",
      populate: { path: "type", select: "name" },
    },
  },
];

const PLACE_LIST_POPULATE = [
  { path: "placeCategory", select: "name" },
  { path: "user", select: "_id username description" },
];

const toObjectIds = (ids: string[]) => ids.map((id) => new Types.ObjectId(id));

class MongoosePlaceRepository implements IPlaceRepository {
  async save(place: Place): Promise<PlaceId> {
    const document = await PlaceModel.create(PlaceMapper.toPersistence(place));
    return PlaceId.from(document._id.toString());
  }

  async update(place: Place): Promise<void> {
    if (!place.id) {
      return;
    }
    const persistence = PlaceMapper.toPersistence(place);
    await PlaceModel.updateOne(
      { _id: place.id },
      {
        location: persistence.location,
        placeCategory: persistence.placeCategory,
        defaultSchedule: persistence.defaultSchedule,
        customDates: persistence.customDates,
        updatedAt: place.updatedAt,
      }
    ).exec();
  }

  async findById(id: PlaceId): Promise<Place | null> {
    const document = await PlaceModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return PlaceMapper.toDomain(document as PlaceDocumentWithId);
  }

  async findDetailsById(id: PlaceId): Promise<PlaceDetailsReadModel | null> {
    const document = await PlaceModel.findById(id)
      .select(
        "_id location rating placeCategory defaultSchedule customDates deleted user createdAt updatedAt"
      )
      .populate(PLACE_DETAILS_POPULATE)
      .lean();

    if (!document) {
      return null;
    }

    return PlaceReadMapper.toDetail(document);
  }

  async findList(
    filters: PlaceListFilters
  ): Promise<PlaceListItemReadModel[]> {
    const query: FilterQuery<PlaceDocumentProps> = { deleted: false };

    if (filters.placeCategoryId) {
      query.placeCategory = new Types.ObjectId(filters.placeCategoryId);
    }

    const documents = await PlaceModel.find(query)
      .select(
        "_id location rating placeCategory defaultSchedule customDates user createdAt updatedAt"
      )
      .populate(PLACE_LIST_POPULATE)
      .sort({ createdAt: -1 })
      .limit(filters.limit ?? 10)
      .lean();

    return PlaceReadMapper.toListItems(documents);
  }

  async findInView(
    query: PlacesInViewQuery
  ): Promise<PlaceListItemReadModel[]> {
    const pipeline = this.buildInViewPipeline(query);
    const documents = await PlaceModel.aggregate(
      pipeline as unknown as PipelineStage[]
    ).exec();
    return PlaceReadMapper.toListItems(documents);
  }

  async findIdsByUserId(userId: UserId): Promise<PlaceId[]> {
    const documents = await PlaceModel.find({
      user: new Types.ObjectId(userId),
    })
      .select("_id")
      .lean();

    return documents.map((doc) => PlaceId.from(doc._id.toString()));
  }

  async findAdminSummariesByUserId(
    userId: UserId,
    limit: number
  ): Promise<PlaceListItemReadModel[]> {
    const documents = await PlaceModel.find({
      user: new Types.ObjectId(userId),
    })
      .select("_id location deleted createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return PlaceReadMapper.toListItems(documents);
  }

  async updateRating(id: PlaceId, rating: number): Promise<void> {
    await PlaceModel.updateOne({ _id: id }, { rating }).exec();
  }

  async deleteOne(id: PlaceId): Promise<void> {
    await PlaceModel.findByIdAndDelete(id).exec();
  }

  async softDelete(id: PlaceId, update: PlaceSoftDeleteUpdate): Promise<void> {
    await PlaceModel.updateOne(
      { _id: id },
      {
        deleted: update.deleted,
        deletedAt: update.deletedAt,
        deletedBy: update.deletedBy
          ? new Types.ObjectId(update.deletedBy)
          : undefined,
        deleteReason: update.deleteReason,
      }
    ).exec();
  }

  private buildInViewPipeline(query: PlacesInViewQuery): Record<string, unknown>[] {
    const {
      placeTypes,
      placeCategories,
      minRating,
      userCategoryIds = [],
      productCategoryIds = [],
    } = query.clientFilters;

    const pipeline: Record<string, unknown>[] = [];

    if (query.ids?.length) {
      pipeline.push({
        $match: {
          _id: { $in: toObjectIds(query.ids) },
          deleted: { $ne: true },
        },
      });
    } else {
      pipeline.push({
        $match: {
          deleted: { $ne: true },
          location: {
            $geoWithin: { $box: [query.sw!, query.ne!] },
          },
        },
      });
    }

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

    pipeline.push({ $limit: query.limit });

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
      },
      {
        $project: {
          location: 1,
          rating: 1,
          placeCategory: "$_placeCat",
          user: "$_userDisplay",
        },
      }
    );

    return pipeline;
  }
}

export default MongoosePlaceRepository;
