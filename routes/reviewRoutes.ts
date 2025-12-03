import express, { Router } from "express";
import auth from "../middlewares/auth";
import reviewOwnership from "../middlewares/reviewOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateReviewAction from "../actions/reviews/CreateReviewAction";
import UpdateReviewAction from "../actions/reviews/UpdateReviewAction";
import DeleteReviewAction from "../actions/reviews/DeleteReviewAction";
import ViewReviewsListAction from "../actions/reviews/ViewReviewsListAction";
import MongooseReviewRepository from "../repositories/reviews/MongooseReviewRepository";
import CreateReviewController from "../controllers/reviews/createReviewController";
import ViewReviewsListController from "../controllers/reviews/viewReviewsListController";
import UpdateReviewController from "../controllers/reviews/updateReviewController";
import DeleteReviewController from "../controllers/reviews/deleteReviewController";

// Initialize repositories
const reviewRepository = MongooseReviewRepository();

// Initialize actions
const createReviewAction = CreateReviewAction(reviewRepository);
const updateReviewAction = UpdateReviewAction(reviewRepository);
const deleteReviewAction = DeleteReviewAction(reviewRepository);
const viewReviewsListAction = ViewReviewsListAction(reviewRepository);

// Initialize controllers
const createReviewController = CreateReviewController(createReviewAction);
const viewReviewsListController = ViewReviewsListController(
  viewReviewsListAction
);
const updateReviewController = UpdateReviewController(updateReviewAction);
const deleteReviewController = DeleteReviewController(deleteReviewAction);

const router: Router = express.Router();

router.post("/", auth, createReviewController);
router.get("/", viewReviewsListController);
router.put("/:reviewId", auth, reviewOwnership, updateReviewController);
router.delete(
  "/:reviewId",
  auth,
  strictLimiter,
  reviewOwnership,
  deleteReviewController
);

export default router;
