import { ICommentRepository } from "../../repositories/comments/ICommentRepository";
import { UpdateCommentInput } from "../../validations/commentValidations";

export interface IUpdateCommentAction {
  execute(params: {
    commentId: string;
    commentData: UpdateCommentInput;
  }): Promise<void>;
}

class UpdateCommentAction implements IUpdateCommentAction {
  constructor(private commentRepository: ICommentRepository) {}

  async execute({
    commentId,
    commentData,
  }: {
    commentId: string;
    commentData: UpdateCommentInput;
  }): Promise<void> {
    await this.commentRepository.updateOne(commentId, commentData);
  }
}

export default UpdateCommentAction;
