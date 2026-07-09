import Comment from "../models/Comment";
import { IComment } from "@/types/models/comment";
import {
  ICommentRepository,
  CommentFilters,
} from "@/types/repositories/comment.repository.types";
import { Types, FilterQuery } from "mongoose";
import { BaseMongooseRepository } from "./baseMongooseRepository";

class CommentRepository
  extends BaseMongooseRepository<IComment, CommentFilters>
  implements ICommentRepository
{
  constructor() {
    super(Comment);
  }

  protected buildQuery(filters?: CommentFilters): FilterQuery<IComment> {
    const query: FilterQuery<IComment> = {};

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

  async create(comment: Partial<IComment>): Promise<Types.ObjectId> {
    return super.create(comment);
  }
}

export default CommentRepository;
