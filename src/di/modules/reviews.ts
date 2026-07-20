import { asClass, AwilixContainer } from "awilix";
import ReviewsController from "@src/api/controllers/ReviewsController";
import CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import GetMyReviewsUseCase from "@src/application/usecases/reviews/GetMyReviews.usecase";
import GetReceivedReviewsUseCase from "@src/application/usecases/reviews/GetReceivedReviews.usecase";
import GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import UpdateReviewUseCase from "@src/application/usecases/reviews/UpdateReview.usecase";
import ReviewRatingUpdaterAdapter from "@src/infrastructure/adapters/ReviewRatingUpdater.adapter";
import ReviewTargetCheckerAdapter from "@src/infrastructure/adapters/ReviewTargetChecker.adapter";
import UserPlaceResolverAdapter from "@src/infrastructure/adapters/UserPlaceResolver.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerReviewsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    targetChecker: asClass(ReviewTargetCheckerAdapter).singleton(),
    ratingUpdater: asClass(ReviewRatingUpdaterAdapter).singleton(),
    userPlaceResolver: asClass(UserPlaceResolverAdapter).singleton(),
    createReviewUseCase: asClass(CreateReviewUseCase).singleton(),
    getReviewsUseCase: asClass(GetReviewsUseCase).singleton(),
    getMyReviewsUseCase: asClass(GetMyReviewsUseCase).singleton(),
    getReceivedReviewsUseCase: asClass(GetReceivedReviewsUseCase).singleton(),
    updateReviewUseCase: asClass(UpdateReviewUseCase).singleton(),
    deleteReviewUseCase: asClass(DeleteReviewUseCase).singleton(),

    reviewsController: asClass(ReviewsController).singleton(),
  });
};
