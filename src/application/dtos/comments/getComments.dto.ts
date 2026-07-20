import { CommentListItemReadModel } from "@src/domain/read-models/comment.read-models";

export interface GetCommentsInput {
  referenceId: string;
  referenceType: string;
  authorId?: string;
}

export type GetCommentsOutput = CommentListItemReadModel[];
