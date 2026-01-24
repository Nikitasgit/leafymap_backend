import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { CreateCommentInput } from "../../validations/comment.validations";
import { Types } from "mongoose";

export interface ICreateCommentAction {
  execute(params: {
    commentData: CreateCommentInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

class CreateCommentAction implements ICreateCommentAction {
  constructor(private commentRepository: ICommentRepository) {}

  async execute({
    commentData,
    authorId,
  }: {
    commentData: CreateCommentInput;
    authorId: string;
  }): Promise<{ _id: string }> {
    const { reference, referenceType, content } = commentData;

    // Note: Reference existence is already verified by commentReferenceOwnership middleware
    const commentId = await this.commentRepository.create({
      author: new Types.ObjectId(authorId),
      content,
      reference: new Types.ObjectId(reference),
      referenceType,
    });

    return { _id: commentId.toString() };
  }
}

export default CreateCommentAction;
