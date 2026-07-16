import {
  IReviewRepository,
  ReviewListItem,
} from "@src/domain/interfaces/IReviewRepository";
import {
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { GetReviewsInput } from "@src/application/dtos/reviews/getReviews.dto";

export interface IGetReviewsUseCase {
  execute(input: GetReviewsInput): Promise<ReviewListItem[]>;
}

class GetReviewsUseCase implements IGetReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: GetReviewsInput): Promise<ReviewListItem[]> {
    return this.reviewRepository.findByReference(
      ReferenceId.from(input.referenceId),
      ReviewReferenceType.from(input.referenceType),
      input.authorId ? UserId.from(input.authorId) : undefined
    );
  }
}

export default GetReviewsUseCase;
