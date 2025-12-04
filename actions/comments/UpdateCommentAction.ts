import { ICommentRepository } from "../../repositories/comments/ICommentRepository";
import { UpdateCommentInput } from "../../validations/commentValidations";

export interface IUpdateCommentAction {
  execute(params: {
    commentId: string;
    commentData: UpdateCommentInput;
  }): Promise<void>;
}

const UpdateCommentAction = (
  commentRepository: ICommentRepository
): IUpdateCommentAction => ({
  execute: async ({ commentId, commentData }) => {
    await commentRepository.updateOne(commentId, commentData);
  },
});

export default UpdateCommentAction;
