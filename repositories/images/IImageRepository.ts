import { IImage } from "../../types/models/Image";
import { Types } from "mongoose";

export type ImageReferenceType =
  | "Place"
  | "User"
  | "Event"
  | "Comment"
  | "Review";
export type ImageType = "profile" | "cover" | "gallery" | "other";

export interface ImageFilters {
  reference?: string;
  referenceType?: ImageReferenceType;
  user?: string;
  type?: ImageType;
  _id?: { $in: string[] };
  [key: string]: unknown;
}

export interface IImageRepository {
  create(image: Partial<IImage>): Promise<Types.ObjectId>;
  createMany(images: Partial<IImage>[]): Promise<Types.ObjectId[]>;
  findById(
    id: string,
    project?: (keyof IImage | string)[]
  ): Promise<IImage | null>;
  findAll<K extends keyof IImage>(params: {
    filters?: ImageFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IImage, K>[]>;
  deleteMany(ids: string[]): Promise<void>;
}
