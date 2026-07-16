import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import {
  GetCommentsInput,
  GetCommentsOutput,
} from "@src/application/dtos/comments/getComments.dto";

export interface IGetCommentsUseCase {
  execute(input: GetCommentsInput): Promise<GetCommentsOutput>;
}

class GetCommentsUseCase implements IGetCommentsUseCase {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async execute(input: GetCommentsInput): Promise<GetCommentsOutput> {
    return this.commentRepository.findByReference(
      ReferenceId.from(input.referenceId),
      CommentReferenceType.from(input.referenceType),
      input.authorId ? UserId.from(input.authorId) : undefined
    );
  }
}

export default GetCommentsUseCase;
