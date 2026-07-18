import {
  ImageRepository,
  PlaceRepository,
  UserRepository,
} from "@/repositories";
import {
  UploadImagesAction,
  DeleteImagesAction,
  GetImagesAction,
} from "@/actions/images";
import {
  UploadImagesController,
  DeleteImagesController,
  GetImagesController,
} from "@/controllers/images";
import {
  AuthMiddleware,
  ImagesMiddleware,
  UploadMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";
import { mongooseEventRepository } from "@/di/container";

// Initialize repositories
const imageRepository = new ImageRepository();
const placeRepository = new PlaceRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const imagesMiddleware = new ImagesMiddleware(
  imageRepository,
  placeRepository,
  mongooseEventRepository
);
export const uploadMiddleware = new UploadMiddleware();
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const uploadImagesAction = new UploadImagesAction(imageRepository);
const deleteImagesAction = new DeleteImagesAction(imageRepository);
const getImagesAction = new GetImagesAction(imageRepository);

export const uploadImages = UploadImagesController(uploadImagesAction);
export const deleteImages = DeleteImagesController(deleteImagesAction);
export const getImages = GetImagesController(getImagesAction);
