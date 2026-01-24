import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { UpdateCommentInput } from "../../validations/comment.validations";

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
