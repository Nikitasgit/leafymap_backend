import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { CommentId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UpdateCommentInput } from "@src/application/dtos/comments/updateComment.dto";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

export interface IUpdateCommentUseCase {
  execute(input: UpdateCommentInput): Promise<void>;
}

class UpdateCommentUseCase implements IUpdateCommentUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: UpdateCommentInput): Promise<void> {
    const commentId = CommentId.from(input.commentId);
    const authorId = UserId.from(input.authorId);
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new NotFoundError(
        ERROR_CODES.COMMENT_NOT_FOUND,
        "Comment not found"
      );
    }

    if (!comment.belongsTo(authorId)) {
      throw new ForbiddenError(
        ERROR_CODES.COMMENT_FORBIDDEN,
        "You can only update your own comments"
      );
    }

    const updated = comment.updateContent(input.content);
    await this.commentRepository.update(updated);
  }
}

export default UpdateCommentUseCase;
