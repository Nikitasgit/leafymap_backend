import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { ReviewListItemReadModel } from "@src/domain/read-models/review.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { GetMyReviewsInput } from "@src/application/dtos/reviews/getMyReviews.dto";

class GetMyReviewsUseCase {
  constructor(private readonly reviewRepository: IReviewRepository) {}

  async execute(
    input: GetMyReviewsInput
  ): Promise<ReviewListItemReadModel[]> {
    return this.reviewRepository.findByAuthorWithPlaceReference(
      UserId.from(input.authorId)
    );
  }
}

export default GetMyReviewsUseCase;
