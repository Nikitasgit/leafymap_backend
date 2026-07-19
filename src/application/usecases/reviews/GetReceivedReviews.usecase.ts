import {
  IReviewRepository,
  ReviewListItem,
} from "@src/domain/interfaces/IReviewRepository";
import { IUserPlaceResolver } from "@src/domain/interfaces/IUserPlaceResolver";
import { ReferenceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  GetReceivedReviewsInput,
  GetReceivedReviewsOutput,
} from "@src/application/dtos/reviews/getReceivedReviews.dto";

class GetReceivedReviewsUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userPlaceResolver: IUserPlaceResolver
  ) {}

  async execute(
    input: GetReceivedReviewsInput
  ): Promise<GetReceivedReviewsOutput> {
    const placeId = await this.userPlaceResolver.findPlaceIdByUserId(
      UserId.from(input.userId)
    );

    if (!placeId) {
      return { reviews: [] as ReviewListItem[], noPlace: true };
    }

    const reviews = await this.reviewRepository.findByReference(
      ReferenceId.from(placeId),
      ReviewReferenceType.from("Place")
    );

    return { reviews, noPlace: false };
  }
}

export default GetReceivedReviewsUseCase;
