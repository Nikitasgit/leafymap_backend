import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { ReviewReferenceType } from "../../types/models/review";
import { CreateReviewInput } from "../../validations/reviewValidations";
import Place from "../../models/Place";
import Event from "../../models/Event";
import User from "../../models/User";
import { Types } from "mongoose";
import { isUserOwnerOfReference } from "../../utils/ownershipCheck";

export interface ICreateReviewAction {
  execute(params: {
    reviewData: CreateReviewInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

const CreateReviewAction = (
  reviewRepository: IReviewRepository
): ICreateReviewAction => ({
  execute: async ({ reviewData, authorId }) => {
    const { reference, referenceType, rating, comment } = reviewData;

    // Verify that the reference exists
    let referenceExists = false;
    switch (referenceType) {
      case "Place":
        referenceExists = !!(await Place.exists({ _id: reference }));
        break;
      case "Event":
        referenceExists = !!(await Event.exists({ _id: reference }));
        break;
      case "User":
        referenceExists = !!(await User.exists({ _id: reference }));
        break;
    }

    if (!referenceExists) {
      throw new Error(
        `The ${referenceType} reference with ID ${reference} does not exist`
      );
    }

    // Check that the user is not trying to review their own entity
    const isOwner = await isUserOwnerOfReference(
      authorId,
      reference,
      referenceType
    );
    if (isOwner) {
      throw new Error(
        "You cannot leave a review on your own place, event, or profile"
      );
    }

    // Check that the user hasn't already left a review for this entity
    const existingReview = await reviewRepository.findAll({
      filters: {
        author: authorId,
        reference,
        referenceType,
      },
      project: ["_id"],
      limit: 1,
    });

    if (existingReview.length > 0) {
      throw new Error(
        "You have already left a review for this entity. You can only leave one review per entity."
      );
    }

    // Create the review
    const reviewId = await reviewRepository.create({
      author: new Types.ObjectId(authorId),
      rating,
      comment,
      reference: new Types.ObjectId(reference),
      referenceType,
      certified: false,
    });

    return { _id: reviewId.toString() };
  },
});

export default CreateReviewAction;
