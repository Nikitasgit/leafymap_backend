import { ICommentRepository } from "../../repositories/comments/ICommentRepository";

export interface IDeleteCommentAction {
  execute(params: { commentId: string }): Promise<void>;
}

const DeleteCommentAction = (
  commentRepository: ICommentRepository
): IDeleteCommentAction => ({
  execute: async ({ commentId }) => {
    await commentRepository.deleteOne(commentId);
  },
});

export default DeleteCommentAction;
