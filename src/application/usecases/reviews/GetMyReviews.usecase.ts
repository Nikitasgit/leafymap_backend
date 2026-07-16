import {
  IReviewRepository,
  ReviewListItem,
} from "@src/domain/interfaces/IReviewRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyReviewsInput } from "@src/application/dtos/reviews/getMyReviews.dto";

export interface IGetMyReviewsUseCase {
  execute(input: GetMyReviewsInput): Promise<ReviewListItem[]>;
}

class GetMyReviewsUseCase implements IGetMyReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(input: GetMyReviewsInput): Promise<ReviewListItem[]> {
    return this.reviewRepository.findByAuthorWithPlaceReference(
      UserId.from(input.authorId)
    );
  }
}

export default GetMyReviewsUseCase;
