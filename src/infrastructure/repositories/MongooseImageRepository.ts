import { Image } from "@src/domain/entities/Image.entity";
import {
  IImageRepository,
  ImageListFilters,
  ImageSoftDeleteUpdate,
} from "@src/domain/interfaces/IImageRepository";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageMapper } from "@src/infrastructure/mappers/Image.mapper";
import ImageModel, {
  ImageDocumentProps,
} from "@src/infrastructure/persistence/schemas/Image.schema";
import { ImageAdminSummaryReadModel } from "@src/domain/read-models/image.read-models";
import { ImageReadMapper } from "@src/infrastructure/read-mappers/Image.read-mapper";
import { FilterQuery, Types } from "mongoose";

type ImageDocumentWithId = ImageDocumentProps & { _id: Types.ObjectId };

class MongooseImageRepository implements IImageRepository {
  async saveMany(images: Image[]): Promise<ImageId[]> {
    const documents = await ImageModel.insertMany(
      images.map((image) => ImageMapper.toPersistence(image))
    );
    return documents.map((doc) => ImageId.from(doc._id.toString()));
  }

  async findById(id: ImageId): Promise<Image | null> {
    const document = await ImageModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return ImageMapper.toDomain(document as ImageDocumentWithId);
  }

  async findByIds(ids: ImageId[]): Promise<Image[]> {
    if (ids.length === 0) {
      return [];
    }
    const documents = await ImageModel.find({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    })
      .sort({ createdAt: -1 })
      .lean();

    return (documents as ImageDocumentWithId[]).map((doc) =>
      ImageMapper.toDomain(doc)
    );
  }

  async findList(filters: ImageListFilters): Promise<Image[]> {
    const query = this.buildListQuery(filters);
    let mongooseQuery = ImageModel.find(query).sort({ createdAt: -1 });

    if (filters.limit) {
      mongooseQuery = mongooseQuery.limit(filters.limit);
    }

    const documents = await mongooseQuery.lean();
    return (documents as ImageDocumentWithId[]).map((doc) =>
      ImageMapper.toDomain(doc)
    );
  }

  async findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: ImageReferenceType
  ): Promise<ImageId[]> {
    if (referenceIds.length === 0) {
      return [];
    }
    const documents = await ImageModel.find({
      reference: {
        $in: referenceIds.map((id) => new Types.ObjectId(id)),
      },
      referenceType,
    })
      .select("_id")
      .lean();

    return documents.map((doc) => ImageId.from(doc._id.toString()));
  }

  async findIdsByUserId(userId: UserId): Promise<ImageId[]> {
    const documents = await ImageModel.find({
      user: new Types.ObjectId(userId),
    })
      .select("_id")
      .lean();

    return documents.map((doc) => ImageId.from(doc._id.toString()));
  }

  async findAdminSummariesByUserId(
    userId: UserId,
    limit: number
  ): Promise<ImageAdminSummaryReadModel[]> {
    const documents = await ImageModel.find({
      user: new Types.ObjectId(userId),
    })
      .select("_id type referenceType deleted createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return ImageReadMapper.toAdminSummaries(documents);
  }

  async deleteMany(ids: ImageId[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await ImageModel.deleteMany({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    }).exec();
  }

  async softDelete(id: ImageId, update: ImageSoftDeleteUpdate): Promise<void> {
    await ImageModel.findByIdAndUpdate(id, {
      deleted: update.deleted,
      deletedAt: update.deletedAt,
      deletedBy: update.deletedBy
        ? new Types.ObjectId(update.deletedBy)
        : undefined,
      deleteReason: update.deleteReason,
    }).exec();
  }

  private buildListQuery(
    filters: ImageListFilters
  ): FilterQuery<ImageDocumentProps> {
    const query: FilterQuery<ImageDocumentProps> = {};

    if (filters.referenceId) {
      query.reference = new Types.ObjectId(filters.referenceId);
    }
    if (filters.referenceIds && filters.referenceIds.length > 0) {
      query.reference = {
        $in: filters.referenceIds.map((id) => new Types.ObjectId(id)),
      };
    }
    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }
    if (filters.userId) {
      query.user = new Types.ObjectId(filters.userId);
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }
    if (filters.ids && filters.ids.length > 0) {
      query._id = {
        $in: filters.ids.map((id) => new Types.ObjectId(id)),
      };
    }

    return query;
  }
}

export default MongooseImageRepository;
