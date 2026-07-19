import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { ICommentReferenceChecker } from "@src/domain/interfaces/ICommentReferenceChecker";
import { Comment } from "@src/domain/entities/Comment.entity";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import {
  CreateCommentInput,
  CreateCommentOutput,
} from "@src/application/dtos/comments/createComment.dto";
import {
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";

class CreateCommentUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly referenceChecker: ICommentReferenceChecker
  ) {}

  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    const referenceId = ReferenceId.from(input.referenceId);
    const referenceType = CommentReferenceType.from(input.referenceType);

    if (referenceType === "Comment") {
      throw new ValidationError(
        { referenceType: "Comment reference type is not supported yet" },
        ERROR_CODES.COMMENT_REFERENCE_UNSUPPORTED
      );
    }

    const exists = await this.referenceChecker.exists(
      referenceId,
      referenceType
    );
    if (!exists) {
      throw new NotFoundError(
        ERROR_CODES.COMMENT_REFERENCE_NOT_FOUND,
        "Comment reference not found"
      );
    }

    const comment = Comment.create({
      authorId: UserId.from(input.authorId),
      content: input.content,
      referenceId,
      referenceType,
    });

    const id = await this.commentRepository.save(comment);
    return { id };
  }
}

export default CreateCommentUseCase;
