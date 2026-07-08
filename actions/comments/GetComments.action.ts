import {
  ICommentRepository,
  CommentFilters,
} from "@/types/repositories/comment.repository.types";
import { IComment } from "@/types/models/comment";

export interface IGetCommentsAction {
  execute(params: {
    filters?: CommentFilters;
  }): Promise<IComment[] | Partial<IComment>[]>;
}

class GetCommentsAction implements IGetCommentsAction {
  private readonly project: (keyof IComment | string)[] = [
    "_id",
    "author.username",
    "author.image.urls",
    "content",
    "reference",
    "referenceType",
    "createdAt",
    "updatedAt",
  ];

  constructor(private commentRepository: ICommentRepository) {}

  async execute({
    filters,
  }: {
    filters?: CommentFilters;
  }): Promise<IComment[] | Partial<IComment>[]> {
    const comments = await this.commentRepository.findAll({
      filters: { ...filters, deleted: false },
      project: this.project,
    });
    return comments;
  }
}

export default GetCommentsAction;
