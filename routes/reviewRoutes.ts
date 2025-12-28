import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import ReviewsMiddleware from "../middlewares/ReviewsMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import CreateReviewAction from "../actions/reviews/CreateReviewAction";
import UpdateReviewAction from "../actions/reviews/UpdateReviewAction";
import DeleteReviewAction from "../actions/reviews/DeleteReviewAction";
import GetReviewsAction from "../actions/reviews/GetReviewsAction";
import MongooseReviewRepository from "../repositories/reviews/MongooseReviewRepository";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseEventRepository from "../repositories/events/MongooseEventRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import ReviewService from "../services/reviewService";
import CreateReviewController from "../controllers/reviews/createReviewController";
import GetReviewsController from "../controllers/reviews/getReviewsController";
import UpdateReviewController from "../controllers/reviews/updateReviewController";
import DeleteReviewController from "../controllers/reviews/deleteReviewController";

// Initialize repositories
const reviewRepository = new MongooseReviewRepository();
const placeRepository = new MongoosePlaceRepository();
const eventRepository = new MongooseEventRepository();
const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const reviewsMiddleware = new ReviewsMiddleware(
  reviewRepository,
  placeRepository,
  eventRepository
);
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize services
const reviewService = new ReviewService(
  reviewRepository,
  placeRepository,
  eventRepository,
  userRepository
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

const createReviewController = new CreateReviewController(createReviewAction);
const getReviewsController = new GetReviewsController(getReviewsAction);
const updateReviewController = new UpdateReviewController(updateReviewAction);
const deleteReviewController = new DeleteReviewController(deleteReviewAction);

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  reviewsMiddleware.referenceOwnership(),
  createReviewController.handle()
);
router.get("/", getReviewsController.handle());
router.put(
  "/:reviewId",
  authMiddleware.verify(),
  reviewsMiddleware.ownership(),
  updateReviewController.handle()
);
router.delete(
  "/:reviewId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  reviewsMiddleware.ownership(),
  deleteReviewController.handle()
);

export default router;
