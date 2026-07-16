export interface CreateCommentInput {
  authorId: string;
  content: string;
  referenceId: string;
  referenceType: string;
}

export interface CreateCommentOutput {
  id: string;
}
