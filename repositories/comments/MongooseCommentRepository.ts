import Comment from "../../models/Comment";
import { IComment, CommentReferenceType } from "../../types/models/comment";
import { ICommentRepository, CommentFilters } from "./ICommentRepository";
import { Types } from "mongoose";

const MongooseCommentRepository = (): ICommentRepository => {
  // Helper to build query from filters
  const buildQuery = (filters?: CommentFilters): any => {
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
    create: async (comment: Partial<IComment>) => {
      const newComment = new Comment(comment);
      await newComment.save();
      return newComment._id;
    },

    findById: async (id: string, project?: (keyof IComment)[]) => {
      let query = Comment.findById(id);

      if (project && project.length > 0) {
        query = query.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        query = query.populate("author", "username image");
      }

      const comment = await query.lean();
      return comment as IComment | null;
    },

    findAll: async <K extends keyof IComment>(params: {
      filters?: CommentFilters;
      project: K[];
      limit?: number;
      sort?: { [key: string]: 1 | -1 };
    }) => {
      const query = buildQuery(params.filters);

      let mongooseQuery = Comment.find(query);

      // Default sort if not specified
      if (params.sort) {
        mongooseQuery = mongooseQuery.sort(params.sort);
      } else {
        mongooseQuery = mongooseQuery.sort({ createdAt: 1 });
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

      const comments = await mongooseQuery.lean();
      return comments as Pick<IComment, K>[];
    },

    findAllById: async (ids: string[], project?: (keyof IComment)[]) => {
      const objectIds = ids.map((id) => new Types.ObjectId(id));
      const query = { _id: { $in: objectIds } };

      let mongooseQuery = Comment.find(query);

      if (project && project.length > 0) {
        mongooseQuery = mongooseQuery.select(project.join(" "));
      }

      // Always populate author if not specifically projecting
      if (!project || project.includes("author")) {
        mongooseQuery = mongooseQuery.populate("author", "username image");
      }

      const comments = await mongooseQuery.lean();
      return comments as IComment[];
    },

    updateOne: async (id: string, update: Partial<IComment>) => {
      await Comment.updateOne({ _id: id }, update).exec();
    },

    deleteOne: async (id: string) => {
      await Comment.deleteOne({ _id: id }).exec();
    },
  };
};

export default MongooseCommentRepository;
