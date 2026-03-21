import Comment from "../models/Comment";
import { IComment } from "@/types/models/comment";
import {
  ICommentRepository,
  CommentFilters,
} from "@/types/repositories/comment.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class CommentRepository implements ICommentRepository {
  private buildQuery(filters?: CommentFilters): FilterQuery<IComment> {
    const query: FilterQuery<IComment> = {};

    if (!filters) return query;

    if (filters.reference !== undefined) {
      if (
        typeof filters.reference === "object" &&
        filters.reference !== null &&
        "$in" in filters.reference
      ) {
        query.reference = {
          $in: filters.reference.$in.map((id) => new Types.ObjectId(id)),
        };
      } else if (typeof filters.reference === "string") {
        query.reference = new Types.ObjectId(filters.reference);
      }
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

  async create(comment: Partial<IComment>): Promise<Types.ObjectId> {
    const newComment = new Comment(comment);
    await newComment.save();
    return newComment._id;
  }

  async findById(
    id: string,
    project?: (keyof IComment | string)[]
  ): Promise<IComment | null> {
    let query = Comment.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(query, populateConfig);
    }

    const comment = await query.lean();
    return comment as IComment | null;
  }

  async findAll<K extends keyof IComment>(params: {
    filters?: CommentFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IComment, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Comment.find(query);

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

    const comments = await mongooseQuery.lean();
    return comments as unknown as Pick<IComment, K>[];
  }

  async updateOne(id: string, update: Partial<IComment>): Promise<void> {
    await Comment.updateOne({ _id: id }, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Comment.deleteOne({ _id: id }).exec();
  }

  async deleteMany(filters: CommentFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await Comment.deleteMany(query).exec();
  }
}

export default CommentRepository;
