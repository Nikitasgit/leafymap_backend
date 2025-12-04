import {
  ICommentRepository,
  CommentFilters,
} from "../../repositories/comments/ICommentRepository";
import { IComment } from "../../types/models/comment";

export interface IViewCommentsListAction {
  execute(params: {
    filters?: CommentFilters;
    project?: (keyof IComment)[];
  }): Promise<IComment[] | Partial<IComment>[]>;
}

const ViewCommentsListAction = (
  commentRepository: ICommentRepository
): IViewCommentsListAction => ({
  execute: async ({ filters, project }) => {
    // If no project specified, return all fields by default
    const defaultProject: (keyof IComment)[] = [
      "_id",
      "author",
      "content",
      "reference",
      "referenceType",
      "createdAt",
      "updatedAt",
    ];

    const comments = await commentRepository.findAll({
      filters,
      project: project || defaultProject,
    });
    return comments;
  },
});

export default ViewCommentsListAction;
