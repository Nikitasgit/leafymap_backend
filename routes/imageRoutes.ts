import express, { Router } from "express";
import auth from "../middlewares/auth";
import imagesOwnership from "../middlewares/imagesOwnership";
import imageReferenceOwnership from "../middlewares/imageReferenceOwnership";
import upload, { handleUploadError } from "../middlewares/memoryUpload";
import { strictLimiter } from "../middlewares/rateLimiter";
import MongooseImageRepository from "../repositories/images/MongooseImageRepository";
import UploadImagesAction from "../actions/images/UploadImagesAction";
import DeleteImagesAction from "../actions/images/DeleteImagesAction";
import GetImagesAction from "../actions/images/GetImagesAction";
import UploadImagesController from "../controllers/images/uploadImagesController";
import DeleteImagesController from "../controllers/images/deleteImagesController";
import GetImagesController from "../controllers/images/getImagesController";

// Initialize repositories
const imageRepository = new MongooseImageRepository();

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
  auth,
  upload.array("images", 10),
  handleUploadError,
  imageReferenceOwnership,
  uploadImagesController.handle()
);

router.delete(
  "/",
  auth,
  strictLimiter,
  imagesOwnership,
  deleteImagesController.handle()
);

router.get("/", getImagesController.handle());

export default router;
