import { ICommentRepository } from "../../repositories/comments/ICommentRepository";
import Review from "../../models/Review";
import { Types } from "mongoose";
import { isUserOwnerOfReference } from "../../utils/ownershipCheck";
import { ICreateCommentAction } from "./CreateCommentAction";

const CreateReviewCommentAction = (
  commentRepository: ICommentRepository
): ICreateCommentAction => ({
  execute: async ({ commentData, authorId }) => {
    const { reference, referenceType, content } = commentData;

    if (referenceType !== "Review") {
      throw new Error("Invalid reference type for review comment");
    }

    const review = await Review.findById(reference).lean();
    if (!review) {
      throw new Error("Review not found");
    }

    // Verify that the user is the owner of the place/event/user referenced by the review
    const isOwner = await isUserOwnerOfReference(
      authorId,
      review.reference.toString(),
      review.referenceType
    );

    if (!isOwner) {
      throw new Error("You are not authorized to respond to this review");
    }
    const existingComment = await commentRepository.findAll({
      filters: {
        author: authorId,
        reference,
        referenceType: "Review",
      },
      project: ["_id"],
      limit: 1,
    });
    if (existingComment.length > 0) {
      throw new Error("You have already commented on this review");
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

export default CreateReviewCommentAction;
