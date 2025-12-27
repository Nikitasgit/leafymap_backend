import express, { Router } from "express";
import auth from "../middlewares/auth";
import reviewOwnership from "../middlewares/reviewOwnership";
import reviewReferenceOwnership from "../middlewares/reviewReferenceOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateReviewAction from "../actions/reviews/CreateReviewAction";
import UpdateReviewAction from "../actions/reviews/UpdateReviewAction";
import DeleteReviewAction from "../actions/reviews/DeleteReviewAction";
import GetReviewsAction from "../actions/reviews/GetReviewsAction";
import MongooseReviewRepository from "../repositories/reviews/MongooseReviewRepository";
import CreateReviewController from "../controllers/reviews/createReviewController";
import GetReviewsController from "../controllers/reviews/getReviewsController";
import UpdateReviewController from "../controllers/reviews/updateReviewController";
import DeleteReviewController from "../controllers/reviews/deleteReviewController";

const reviewRepository = new MongooseReviewRepository();

const createReviewAction = new CreateReviewAction(reviewRepository);
const updateReviewAction = new UpdateReviewAction(reviewRepository);
const deleteReviewAction = new DeleteReviewAction(reviewRepository);
const getReviewsAction = new GetReviewsAction(reviewRepository);

const createReviewController = new CreateReviewController(createReviewAction);
const getReviewsController = new GetReviewsController(getReviewsAction);
const updateReviewController = new UpdateReviewController(updateReviewAction);
const deleteReviewController = new DeleteReviewController(deleteReviewAction);

const router: Router = express.Router();

router.post(
  "/",
  auth,
  reviewReferenceOwnership,
  createReviewController.handle()
);
router.get("/", getReviewsController.handle());
router.put(
  "/:reviewId",
  auth,
  reviewOwnership,
  updateReviewController.handle()
);
router.delete(
  "/:reviewId",
  auth,
  strictLimiter,
  reviewOwnership,
  deleteReviewController.handle()
);

export default router;
