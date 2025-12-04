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

    // Check that no review was created in the last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const latestReviews = await reviewRepository.findAll({
      filters: {
        author: authorId,
        reference,
        referenceType,
        createdAt: { $gte: threeMonthsAgo },
      },
      project: ["_id", "createdAt"],
      limit: 1,
      sort: { createdAt: -1 },
    });

    if (latestReviews.length > 0) {
      throw new Error(
        "You have already left a review for this entity less than 3 months ago"
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
