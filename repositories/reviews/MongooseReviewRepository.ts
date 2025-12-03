import Review from "../../models/Review";
import { IReview, ReviewReferenceType } from "../../types/models/review";
import { IReviewRepository, ReviewFilters } from "./IReviewRepository";
import { Types } from "mongoose";

const MongooseReviewRepository = (): IReviewRepository => {
  // Helper to build query from filters
  const buildQuery = (filters?: ReviewFilters): any => {
    const query: any = {};

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

    // Add all other filters (for flexibility)
    Object.keys(filters).forEach((key) => {
      if (!["reference", "referenceType", "author", "_id"].includes(key)) {
        query[key] = filters[key];
      }
    });

    return query;
  };

  return {
    create: async (review: Partial<IReview>) => {
      const newReview = new Review(review);
      await newReview.save();
      return newReview._id;
    },

    findById: async (id: string, project?: (keyof IReview)[]) => {
      let query = Review.findById(id);

      if (project && project.length > 0) {
        query = query.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        query = query.populate("author", "username image");
      }

      const review = await query.lean();
      return review as IReview | null;
    },

    findAll: async <K extends keyof IReview>(params: {
      filters?: ReviewFilters;
      project: K[];
      limit?: number;
      sort?: { [key: string]: 1 | -1 };
    }) => {
      const query = buildQuery(params.filters);

      let mongooseQuery = Review.find(query);

      // Default sort if not specified
      if (params.sort) {
        mongooseQuery = mongooseQuery.sort(params.sort);
      } else {
        mongooseQuery = mongooseQuery.sort({ createdAt: -1 });
      }

      // Limit if specified
      if (params.limit) {
        mongooseQuery = mongooseQuery.limit(params.limit);
      }

      if (params.project && params.project.length > 0) {
        mongooseQuery = mongooseQuery.select(params.project.join(" "));
      }

      // Populate author if requested in the project
      if (params.project.includes("author" as K)) {
        mongooseQuery = mongooseQuery.populate("author", "username image");
      }

      const reviews = await mongooseQuery.lean();
      return reviews as Pick<IReview, K>[];
    },

    findAllById: async (ids: string[], project?: (keyof IReview)[]) => {
      const objectIds = ids.map((id) => new Types.ObjectId(id));
      const query = { _id: { $in: objectIds } };

      let mongooseQuery = Review.find(query);

      if (project && project.length > 0) {
        mongooseQuery = mongooseQuery.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        mongooseQuery = mongooseQuery.populate("author", "username image");
      }

      const reviews = await mongooseQuery.lean();
      return reviews as IReview[];
    },

    updateOne: async (id: string, update: Partial<IReview>) => {
      await Review.updateOne({ _id: id }, update).exec();
    },

    deleteOne: async (id: string) => {
      await Review.deleteOne({ _id: id }).exec();
    },
  };
};

export default MongooseReviewRepository;
