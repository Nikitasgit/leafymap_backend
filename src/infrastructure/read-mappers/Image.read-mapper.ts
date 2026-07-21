import {
  ImageAdminSummaryReadModel,
  ImageListItemReadModel,
} from "@src/domain/read-models/image.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class ImageReadMapper {
  static toListItem(doc: unknown): ImageListItemReadModel {
    const image = normalizeLeanDocument<ImageListItemReadModel>(doc);
    return {
      id: image.id,
      urls: image.urls,
      user: image.user,
      reference: image.reference,
      referenceType: image.referenceType,
      type: image.type,
      originalName: image.originalName,
      size: image.size,
      mimetype: image.mimetype,
      deleted: image.deleted,
      deletedAt: image.deletedAt,
      deletedBy: image.deletedBy,
      deleteReason: image.deleteReason,
      createdAt: image.createdAt,
      updatedAt: image.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): ImageListItemReadModel[] {
    return docs.map((doc) => ImageReadMapper.toListItem(doc));
  }

  static toAdminSummary(doc: unknown): ImageAdminSummaryReadModel {
    const image = normalizeLeanDocument<ImageAdminSummaryReadModel>(doc);
    return {
      id: image.id,
      type: image.type,
      referenceType: image.referenceType,
      deleted: image.deleted,
      createdAt: image.createdAt,
    };
  }

  static toAdminSummaries(docs: unknown[]): ImageAdminSummaryReadModel[] {
    return docs.map((doc) => ImageReadMapper.toAdminSummary(doc));
  }
}
