import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";

import { CreateReviewInput } from "../../validations/reviewValidations";
import Place from "../../models/Place";
import Event from "../../models/Event";
import User from "../../models/User";
import { Types } from "mongoose";
import { updateReviewRating } from "../../utils/updateReviewRating";

export interface ICreateReviewAction {
  execute(params: {
    reviewData: CreateReviewInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

class CreateReviewAction implements ICreateReviewAction {
  constructor(private reviewRepository: IReviewRepository) {}

  async execute({
    reviewData,
    authorId,
  }: {
    reviewData: CreateReviewInput;
    authorId: string;
  }): Promise<{ _id: string }> {
    const { reference, referenceType, rating, comment } = reviewData;

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

    const existingReview = await this.reviewRepository.findAll({
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

    const reviewId = await this.reviewRepository.create({
      author: new Types.ObjectId(authorId),
      rating,
      comment,
      reference: new Types.ObjectId(reference),
      referenceType,
      certified: false,
    });

    await updateReviewRating(reference, referenceType);

    return { _id: reviewId.toString() };
  }
}

export default CreateReviewAction;
