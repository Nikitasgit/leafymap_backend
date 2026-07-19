import { Image } from "@src/domain/entities/Image.entity";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";
import {
  ImageId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ImageDocumentProps } from "@src/infrastructure/persistence/schemas/Image.schema";
import { Types } from "mongoose";

type ImageDocumentWithId = ImageDocumentProps & { _id: Types.ObjectId };

export class ImageMapper {
  static toDomain(doc: ImageDocumentWithId): Image {
    return Image.reconstitute({
      id: ImageId.from(doc._id.toString()),
      userId: UserId.from(doc.user.toString()),
      referenceId: ReferenceId.from(doc.reference.toString()),
      referenceType: ImageReferenceType.from(doc.referenceType),
      type: ImageType.from(doc.type),
      urls: {
        original: doc.urls.original,
        thumbnail: doc.urls.thumbnail,
        medium: doc.urls.medium,
      },
      originalName: doc.originalName,
      size: doc.size,
      mimetype: doc.mimetype,
      deleted: doc.deleted ?? false,
      deletedAt: doc.deletedAt,
      deletedBy: doc.deletedBy
        ? UserId.from(doc.deletedBy.toString())
        : undefined,
      deleteReason: doc.deleteReason,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    image: Image
  ): Omit<ImageDocumentProps, "_id" | "createdAt" | "updatedAt"> {
    return {
      urls: {
        original: image.urls.original,
        thumbnail: image.urls.thumbnail,
        medium: image.urls.medium,
      },
      user: new Types.ObjectId(image.userId),
      reference: new Types.ObjectId(image.referenceId),
      referenceType: image.referenceType,
      type: image.type,
      originalName: image.originalName,
      size: image.size,
      mimetype: image.mimetype,
      deleted: image.deleted,
      deletedAt: image.deletedAt,
      deletedBy: image.deletedBy
        ? new Types.ObjectId(image.deletedBy)
        : undefined,
      deleteReason: image.deleteReason,
    };
  }
}
