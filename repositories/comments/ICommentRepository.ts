import { IComment, CommentReferenceType } from "../../types/models/comment";
import { Types } from "mongoose";

export interface CommentFilters {
  reference?: string;
  referenceType?: CommentReferenceType;
  author?: string;
  _id?: { $in: string[] };
  [key: string]: any;
}

export interface ICommentRepository {
  create(comment: Partial<IComment>): Promise<Types.ObjectId>;
  findById(
    id: string,
    project?: (keyof IComment | string)[]
  ): Promise<IComment | null>;
  findAll<K extends keyof IComment>(params: {
    filters?: CommentFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IComment, K>[]>;
  updateOne(id: string, update: Partial<IComment>): Promise<void>;
  deleteOne(id: string): Promise<void>;
}
