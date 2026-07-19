import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";
import { ImageUrls } from "@src/domain/value-objects/ImageUrls.vo";

export interface CreateImageParams {
  userId: UserId;
  referenceId: ReferenceId;
  referenceType: ImageReferenceType;
  type: ImageType;
  urls: ImageUrls;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface ReconstituteImageParams extends CreateImageParams {
  id: ImageId;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: UserId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Image {
  private constructor(
    public readonly id: ImageId | null,
    public readonly userId: UserId,
    public readonly referenceId: ReferenceId,
    public readonly referenceType: ImageReferenceType,
    public readonly type: ImageType,
    public readonly urls: ImageUrls,
    public readonly originalName: string,
    public readonly size: number,
    public readonly mimetype: string,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | undefined,
    public readonly deletedBy: UserId | undefined,
    public readonly deleteReason: string | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateImageParams): Image {
    const now = new Date();
    return new Image(
      null,
      params.userId,
      params.referenceId,
      params.referenceType,
      params.type,
      params.urls,
      params.originalName,
      params.size,
      params.mimetype,
      false,
      undefined,
      undefined,
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteImageParams): Image {
    return new Image(
      params.id,
      params.userId,
      params.referenceId,
      params.referenceType,
      params.type,
      params.urls,
      params.originalName,
      params.size,
      params.mimetype,
      params.deleted,
      params.deletedAt,
      params.deletedBy,
      params.deleteReason,
      params.createdAt,
      params.updatedAt
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.userId === userId;
  }
}
