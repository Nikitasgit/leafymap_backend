import {
  ICommentRepository,
  CommentFilters,
} from "../../repositories/comments/ICommentRepository";
import { IComment } from "../../types/models/comment";

export interface IViewCommentsListAction {
  execute(params: {
    filters?: CommentFilters;
  }): Promise<IComment[] | Partial<IComment>[]>;
}

class ViewCommentsListAction implements IViewCommentsListAction {
  private readonly project: (keyof IComment | string)[] = [
    "_id",
    "author.username",
    "author.creatorName",
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
      filters,
      project: this.project,
    });
    return comments;
  }
}

export default ViewCommentsListAction;
