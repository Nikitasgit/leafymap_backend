import { Image } from "@src/domain/entities/Image.entity";
import { ImageAdminSummaryReadModel } from "@src/domain/read-models/image.read-models";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";
import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface ImageListFilters {
  referenceId?: ReferenceId;
  referenceIds?: ReferenceId[];
  referenceType?: ImageReferenceType;
  userId?: UserId;
  type?: ImageType;
  deleted?: boolean;
  ids?: ImageId[];
  limit?: number;
}

export interface ImageSoftDeleteUpdate {
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
}

export interface IImageRepository {
  saveMany(images: Image[]): Promise<ImageId[]>;
  findById(id: ImageId): Promise<Image | null>;
  findByIds(ids: ImageId[]): Promise<Image[]>;
  findList(filters: ImageListFilters): Promise<Image[]>;
  findIdsByReferences(
    referenceIds: ReferenceId[],
    referenceType: ImageReferenceType
  ): Promise<ImageId[]>;
  findIdsByUserId(userId: UserId): Promise<ImageId[]>;
  findAdminSummariesByUserId(
    userId: UserId,
    limit: number
  ): Promise<ImageAdminSummaryReadModel[]>;
  deleteMany(ids: ImageId[]): Promise<void>;
  softDelete(id: ImageId, update: ImageSoftDeleteUpdate): Promise<void>;
}
