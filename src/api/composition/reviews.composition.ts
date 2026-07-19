import CreateReviewUseCase from "@src/application/usecases/reviews/CreateReview.usecase";
import GetReviewsUseCase from "@src/application/usecases/reviews/GetReviews.usecase";
import GetMyReviewsUseCase from "@src/application/usecases/reviews/GetMyReviews.usecase";
import GetReceivedReviewsUseCase from "@src/application/usecases/reviews/GetReceivedReviews.usecase";
import UpdateReviewUseCase from "@src/application/usecases/reviews/UpdateReview.usecase";
import DeleteReviewUseCase from "@src/application/usecases/reviews/DeleteReview.usecase";
import CreateReviewController from "@src/api/controllers/reviews/createReview.controller";
import GetReviewsController from "@src/api/controllers/reviews/getReviews.controller";
import GetMyReviewsController from "@src/api/controllers/reviews/getMyReviews.controller";
import GetReceivedReviewsController from "@src/api/controllers/reviews/getReceivedReviews.controller";
import UpdateReviewController from "@src/api/controllers/reviews/updateReview.controller";
import DeleteReviewController from "@src/api/controllers/reviews/deleteReview.controller";
import ReviewTargetCheckerAdapter from "@src/infrastructure/adapters/ReviewTargetChecker.adapter";
import ReviewRatingUpdaterAdapter from "@src/infrastructure/adapters/ReviewRatingUpdater.adapter";
import UserPlaceResolverAdapter from "@src/infrastructure/adapters/UserPlaceResolver.adapter";
import {
  authMiddleware,
  mongooseEventRepository,
  mongooseReviewRepository,
  mongoosePlaceRepository,
  mongooseUserRepository,
  rateLimiterMiddleware,
} from "@src/di/container";

const reviewTargetChecker = new ReviewTargetCheckerAdapter(
  mongoosePlaceRepository,
  mongooseEventRepository
);
const reviewRatingUpdater = new ReviewRatingUpdaterAdapter(
  mongooseReviewRepository,
  mongoosePlaceRepository,
  mongooseEventRepository
);
const userPlaceResolver = new UserPlaceResolverAdapter(mongooseUserRepository);

const createReviewUseCase = new CreateReviewUseCase(
  mongooseReviewRepository,
  reviewTargetChecker,
  reviewRatingUpdater
);
const getReviewsUseCase = new GetReviewsUseCase(mongooseReviewRepository);
const getMyReviewsUseCase = new GetMyReviewsUseCase(mongooseReviewRepository);
const getReceivedReviewsUseCase = new GetReceivedReviewsUseCase(
  mongooseReviewRepository,
  userPlaceResolver
);
const updateReviewUseCase = new UpdateReviewUseCase(
  mongooseReviewRepository,
  reviewRatingUpdater
);
const deleteReviewUseCase = new DeleteReviewUseCase(
  mongooseReviewRepository,
  reviewRatingUpdater
);

export { authMiddleware, rateLimiterMiddleware };

export const createReview = CreateReviewController(createReviewUseCase);
export const getReviews = GetReviewsController(getReviewsUseCase);
export const getMyReviews = GetMyReviewsController(getMyReviewsUseCase);
export const getReceivedReviews = GetReceivedReviewsController(
  getReceivedReviewsUseCase
);
export const updateReview = UpdateReviewController(updateReviewUseCase);
export const deleteReview = DeleteReviewController(deleteReviewUseCase);
