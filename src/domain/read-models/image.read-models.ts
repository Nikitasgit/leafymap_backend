import { ImageUrls } from "@src/domain/value-objects/ImageUrls.vo";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ImageType } from "@src/domain/value-objects/ImageType.vo";

export interface ImageListItemReadModel {
  id: string;
  urls: ImageUrls;
  user: string;
  reference: string;
  referenceType: ImageReferenceType;
  type: ImageType;
  originalName: string;
  size: number;
  mimetype: string;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Summary view returned by findAdminSummariesByUserId. */
export interface ImageAdminSummaryReadModel {
  id: string;
  type?: ImageType;
  referenceType?: ImageReferenceType;
  deleted?: boolean;
  createdAt?: string | Date;
}
