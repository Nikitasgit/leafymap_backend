import {
  ImageRepository,
  PlaceRepository,
  EventRepository,
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

// Initialize repositories
const imageRepository = new ImageRepository();
const placeRepository = new PlaceRepository();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const imagesMiddleware = new ImagesMiddleware(
  imageRepository,
  placeRepository,
  eventRepository
);
export const uploadMiddleware = new UploadMiddleware();
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const uploadImagesAction = new UploadImagesAction(imageRepository);
const deleteImagesAction = new DeleteImagesAction(imageRepository);
const getImagesAction = new GetImagesAction(imageRepository);

// Initialize controllers
export const uploadImages = UploadImagesController(uploadImagesAction);
export const deleteImages = DeleteImagesController(deleteImagesAction);
export const getImages = GetImagesController(getImagesAction);
