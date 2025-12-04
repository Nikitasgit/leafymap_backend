import { ICommentRepository } from "../../repositories/comments/ICommentRepository";
import { CreateCommentInput } from "../../validations/commentValidations";
import Review from "../../models/Review";
import Image from "../../models/Image";
import Comment from "../../models/Comment";
import { Types } from "mongoose";

export interface ICreateCommentAction {
  execute(params: {
    commentData: CreateCommentInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

const CreateCommentAction = (
  commentRepository: ICommentRepository
): ICreateCommentAction => ({
  execute: async ({ commentData, authorId }) => {
    const { reference, referenceType, content } = commentData;

    // Verify that the reference exists
    let referenceExists = false;
    switch (referenceType) {
      case "Review":
        referenceExists = !!(await Review.exists({ _id: reference }));
        break;
      case "Image":
        referenceExists = !!(await Image.exists({ _id: reference }));
        break;
      case "Comment":
        referenceExists = !!(await Comment.exists({ _id: reference }));
        break;
    }

    if (!referenceExists) {
      throw new Error(
        `The ${referenceType} reference with ID ${reference} does not exist`
      );
    }

    // Create the comment
    const commentId = await commentRepository.create({
      author: new Types.ObjectId(authorId),
      content,
      reference: new Types.ObjectId(reference),
      referenceType,
    });

    return { _id: commentId.toString() };
  },
});

export default CreateCommentAction;
