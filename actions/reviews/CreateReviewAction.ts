import { IReviewRepository } from "../../repositories/reviews/IReviewRepository";
import { CreateReviewInput } from "../../validations/reviewValidations";
import { Types } from "mongoose";
import ReviewService from "../../services/reviewService";

export interface ICreateReviewAction {
  execute(params: {
    reviewData: CreateReviewInput;
    authorId: string;
  }): Promise<{ _id: string }>;
}

class CreateReviewAction implements ICreateReviewAction {
  private reviewService: ReviewService;

  constructor(
    private reviewRepository: IReviewRepository,
    reviewService: ReviewService
  ) {
    this.reviewService = reviewService;
  }

  async execute({
    reviewData,
    authorId,
  }: {
    reviewData: CreateReviewInput;
    authorId: string;
  }): Promise<{ _id: string }> {
    const { reference, referenceType, rating, comment } = reviewData;

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

    await this.reviewService.updateReviewRating(reference, referenceType);

    return { _id: reviewId.toString() };
  }
}

export default CreateReviewAction;
