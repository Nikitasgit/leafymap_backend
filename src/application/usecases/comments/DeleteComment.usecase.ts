import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { CommentId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { DeleteCommentInput } from "@src/application/dtos/comments/deleteComment.dto";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface IDeleteCommentUseCase {
  execute(input: DeleteCommentInput): Promise<void>;
}

class DeleteCommentUseCase implements IDeleteCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: DeleteCommentInput): Promise<void> {
    const commentId = CommentId.from(input.commentId);
    const authorId = UserId.from(input.authorId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment || !comment.id) {
      throw new NotFoundError(
        ERROR_CODES.COMMENT_NOT_FOUND,
        "Comment not found"
      );
    }

    if (!comment.belongsTo(authorId)) {
      throw new ForbiddenError(
        ERROR_CODES.COMMENT_FORBIDDEN,
        "You can only delete your own comments"
      );
    }

    await this.commentRepository.delete(comment.id);
  }
}

export default DeleteCommentUseCase;
