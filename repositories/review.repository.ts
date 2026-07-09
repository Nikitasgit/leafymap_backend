import Review from "../models/Review";
import { IReview } from "@/types/models/review";
import {
  IReviewRepository,
  ReviewFilters,
} from "@/types/repositories/review.repository.types";
import { Types, FilterQuery } from "mongoose";
import { BaseMongooseRepository } from "./baseMongooseRepository";

class ReviewRepository
  extends BaseMongooseRepository<IReview, ReviewFilters>
  implements IReviewRepository
{
  constructor() {
    super(Review);
  }

  protected buildQuery(filters?: ReviewFilters): FilterQuery<IReview> {
    const query: FilterQuery<IReview> = {};

    if (!filters) return query;

    if (filters.reference !== undefined) {
      if (
        typeof filters.reference === "object" &&
        filters.reference !== null &&
        "$in" in filters.reference
      ) {
        query.reference = {
          $in: filters.reference.$in.map((id) => this.toObjectId(id)),
        };
      } else if (typeof filters.reference === "string") {
        query.reference = this.toObjectId(filters.reference);
      }
    }
    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }
    if (filters.author) {
      query.author = this.toObjectId(filters.author);
    }
    if (filters._id) {
      query._id = {
        $in: filters._id.$in.map((id) => this.toObjectId(id)),
      };
    }
    if (typeof filters.deleted === "boolean") {
      query.deleted = filters.deleted;
    }

    Object.keys(filters).forEach((key) => {
      if (
        !["reference", "referenceType", "author", "_id", "deleted"].includes(
          key
        )
      ) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(review: Partial<IReview>): Promise<Types.ObjectId> {
    return super.create(review);
  }
}

export default ReviewRepository;
