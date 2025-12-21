import Review from "../../models/Review";
import { IReview } from "../../types/models/review";
import { IReviewRepository, ReviewFilters } from "./IReviewRepository";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "../utils/PopulateParser";

class MongooseReviewRepository implements IReviewRepository {
  private buildQuery(filters?: ReviewFilters): FilterQuery<IReview> {
    const query: FilterQuery<IReview> = {};

    if (!filters) return query;

    if (filters.reference) {
      query.reference = new Types.ObjectId(filters.reference);
    }
    if (filters.referenceType) {
      query.referenceType = filters.referenceType;
    }
    if (filters.author) {
      query.author = new Types.ObjectId(filters.author);
    }
    if (filters._id) {
      query._id = {
        $in: filters._id.$in.map((id) => new Types.ObjectId(id)),
      };
    }

    Object.keys(filters).forEach((key) => {
      if (!["reference", "referenceType", "author", "_id"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(review: Partial<IReview>): Promise<Types.ObjectId> {
    const newReview = new Review(review);
    await newReview.save();
    return newReview._id;
  }

  async findById(
    id: string,
    project?: (keyof IReview | string)[]
  ): Promise<IReview | null> {
    let query = Review.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig);
    }

    const review = await query.lean();
    return review as IReview | null;
  }

  async findAll<K extends keyof IReview>(params: {
    filters?: ReviewFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IReview, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Review.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    } else {
      mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      );
    }

    const reviews = await mongooseQuery.lean();
    return reviews as Pick<IReview, K>[];
  }

  async updateOne(id: string, update: Partial<IReview>): Promise<void> {
    await Review.updateOne({ _id: id }, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Review.deleteOne({ _id: id }).exec();
  }
}

export default MongooseReviewRepository;
