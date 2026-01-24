import { ICommentRepository } from "@/types/repositories/comment.repository.types";

export interface IDeleteCommentAction {
  execute(params: { commentId: string }): Promise<void>;
}

class DeleteCommentAction implements IDeleteCommentAction {
  constructor(private commentRepository: ICommentRepository) {}

  async execute({ commentId }: { commentId: string }): Promise<void> {
    await this.commentRepository.deleteOne(commentId);
  }
}

export default DeleteCommentAction;
