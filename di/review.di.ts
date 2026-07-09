import {
  ReviewRepository,
  PlaceRepository,
  EventRepository,
  UserRepository,
} from "@/repositories";
import {
  CreateReviewAction,
  UpdateReviewAction,
  DeleteReviewAction,
  GetReviewsAction,
} from "@/actions/reviews";
import {
  CreateReviewController,
  GetReviewsController,
  GetMyReviewsController,
  GetReceivedReviewsController,
  UpdateReviewController,
  DeleteReviewController,
} from "@/controllers/reviews";
import {
  AuthMiddleware,
  ReviewsMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";
import ReviewService from "@/services/reviewService";

// Initialize repositories
const reviewRepository = new ReviewRepository();
const placeRepository = new PlaceRepository();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const reviewsMiddleware = new ReviewsMiddleware(
  reviewRepository,
  placeRepository,
  eventRepository
);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize services
const reviewService = new ReviewService(
  reviewRepository,
  placeRepository,
  eventRepository
);

// Initialize actions
const createReviewAction = new CreateReviewAction(
  reviewRepository,
  reviewService
);
const updateReviewAction = new UpdateReviewAction(
  reviewRepository,
  reviewService
);
const deleteReviewAction = new DeleteReviewAction(
  reviewRepository,
  reviewService
);
const getReviewsAction = new GetReviewsAction(reviewRepository);

// Initialize controllers
export const createReview = CreateReviewController(createReviewAction);
export const getReviews = GetReviewsController(getReviewsAction);
export const getMyReviews = GetMyReviewsController(getReviewsAction);
export const getReceivedReviews = GetReceivedReviewsController(
  getReviewsAction,
  userRepository
);
export const updateReview = UpdateReviewController(updateReviewAction);
export const deleteReview = DeleteReviewController(deleteReviewAction);
