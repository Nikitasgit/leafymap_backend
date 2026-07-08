import { IReview, ReviewReferenceType } from "../models/review";
import { Types } from "mongoose";

export interface ReviewFilters {
  reference?: string | { $in: string[] };
  referenceType?: ReviewReferenceType;
  author?: string;
  _id?: { $in: string[] };
  deleted?: boolean;
  [key: string]: unknown;
}

export interface IReviewRepository {
  create(review: Partial<IReview>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IReview | string)[]
  ): Promise<IReview | null>;
  findAll<K extends keyof IReview>(params: {
    filters?: ReviewFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IReview, K>[]>;
  updateOne(id: string, update: Partial<IReview>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: ReviewFilters): Promise<void>;
}
