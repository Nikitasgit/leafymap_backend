import {
  IReviewRepository,
  ReviewListItem,
} from "@src/domain/interfaces/IReviewRepository";
import { ReferenceId } from "@src/domain/value-objects/ObjectId.vo";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  GetReceivedReviewsInput,
  GetReceivedReviewsOutput,
} from "@src/application/dtos/reviews/getReceivedReviews.dto";
import { IUserRepository } from "@/types/repositories/user.repository.types";

function getPlaceIdFromUser(user: { place?: unknown } | null): string | null {
  if (!user?.place) return null;
  const place = user.place;
  if (typeof place === "string") return place;
  if (typeof place === "object" && place !== null && "_id" in place) {
    return String((place as { _id: unknown })._id);
  }
  return null;
}

export interface IGetReceivedReviewsUseCase {
  execute(input: GetReceivedReviewsInput): Promise<GetReceivedReviewsOutput>;
}

class GetReceivedReviewsUseCase implements IGetReceivedReviewsUseCase {
  constructor(
    private readonly reviewRepository: IReviewRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    input: GetReceivedReviewsInput
  ): Promise<GetReceivedReviewsOutput> {
    const user = await this.userRepository.findById(input.userId, [
      "_id",
      "place",
    ]);
    const placeId = user ? getPlaceIdFromUser(user) : null;

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
