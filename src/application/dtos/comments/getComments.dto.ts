import { CommentListItem } from "@src/domain/interfaces/ICommentRepository";

export interface GetCommentsInput {
  referenceId: string;
  referenceType: string;
  authorId?: string;
}

export type GetCommentsOutput = CommentListItem[];
