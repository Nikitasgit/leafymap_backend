import { IReview, ReviewReferenceType } from "../../types/models/review";
import { Types } from "mongoose";

export interface ReviewFilters {
  reference?: string;
  referenceType?: ReviewReferenceType;
  author?: string;
  _id?: { $in: string[] };
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
}
