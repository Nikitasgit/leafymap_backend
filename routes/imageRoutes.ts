import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import ImagesMiddleware from "../middlewares/ImagesMiddleware";
import UploadMiddleware from "../middlewares/UploadMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import MongooseImageRepository from "../repositories/images/MongooseImageRepository";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseEventRepository from "../repositories/events/MongooseEventRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import UploadImagesAction from "../actions/images/UploadImagesAction";
import DeleteImagesAction from "../actions/images/DeleteImagesAction";
import GetImagesAction from "../actions/images/GetImagesAction";
import UploadImagesController from "../controllers/images/uploadImagesController";
import DeleteImagesController from "../controllers/images/deleteImagesController";
import GetImagesController from "../controllers/images/getImagesController";

// Initialize repositories
const imageRepository = new MongooseImageRepository();
const placeRepository = new MongoosePlaceRepository();
const eventRepository = new MongooseEventRepository();
const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const imagesMiddleware = new ImagesMiddleware(
  imageRepository,
  placeRepository,
  eventRepository
);
const uploadMiddleware = new UploadMiddleware();
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const uploadImagesAction = new UploadImagesAction(imageRepository);
const deleteImagesAction = new DeleteImagesAction(imageRepository);
const getImagesAction = new GetImagesAction(imageRepository);

// Initialize controllers
const uploadImagesController = new UploadImagesController(uploadImagesAction);
const deleteImagesController = new DeleteImagesController(deleteImagesAction);
const getImagesController = new GetImagesController(getImagesAction);

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  uploadMiddleware.array("images", 10),
  uploadMiddleware.handleError(),
  imagesMiddleware.referenceOwnership(),
  uploadImagesController.handle()
);

router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.api(),
  imagesMiddleware.ownership(),
  deleteImagesController.handle()
);

router.get("/", getImagesController.handle());

export default router;
