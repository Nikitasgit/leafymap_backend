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
import LegacyReviewTargetCheckerAdapter from "@src/infrastructure/adapters/LegacyReviewTargetChecker.adapter";
import LegacyReviewRatingUpdaterAdapter from "@src/infrastructure/adapters/LegacyReviewRatingUpdater.adapter";
import {
  authMiddleware,
  mongooseEventRepository,
  mongooseReviewRepository,
  placeRepository,
  rateLimiterMiddleware,
  userRepository,
} from "@/di/container";

const reviewTargetChecker = new LegacyReviewTargetCheckerAdapter(
  placeRepository,
  mongooseEventRepository
);
const reviewRatingUpdater = new LegacyReviewRatingUpdaterAdapter(
  mongooseReviewRepository,
  placeRepository,
  mongooseEventRepository
);

const createReviewUseCase = new CreateReviewUseCase(
  mongooseReviewRepository,
  reviewTargetChecker,
  reviewRatingUpdater
);
const getReviewsUseCase = new GetReviewsUseCase(mongooseReviewRepository);
const getMyReviewsUseCase = new GetMyReviewsUseCase(mongooseReviewRepository);
const getReceivedReviewsUseCase = new GetReceivedReviewsUseCase(
  mongooseReviewRepository,
  userRepository
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
