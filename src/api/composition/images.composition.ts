import UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import UploadImagesController from "@src/api/controllers/images/uploadImages.controller";
import GetImagesController from "@src/api/controllers/images/getImages.controller";
import DeleteImagesController from "@src/api/controllers/images/deleteImages.controller";
import ImageReferenceOwnershipCheckerAdapter from "@src/infrastructure/adapters/ImageReferenceOwnershipChecker.adapter";
import {
  authMiddleware,
  awsImageStorage,
  deleteImagesUseCase,
  mongooseEventRepository,
  mongooseImageRepository,
  mongoosePlaceRepository,
  rateLimiterMiddleware,
} from "@src/di/container";
import { UploadMiddleware } from "@src/api/middlewares";

const ownershipChecker = new ImageReferenceOwnershipCheckerAdapter(
  mongoosePlaceRepository,
  mongooseEventRepository
);

const uploadImagesUseCase = new UploadImagesUseCase(
  mongooseImageRepository,
  awsImageStorage,
  ownershipChecker
);
const getImagesUseCase = new GetImagesUseCase(
  mongooseImageRepository,
  awsImageStorage
);

export const uploadMiddleware = new UploadMiddleware();

export { authMiddleware, rateLimiterMiddleware };

export const uploadImages = UploadImagesController(uploadImagesUseCase);
export const getImages = GetImagesController(getImagesUseCase);
export const deleteImages = DeleteImagesController(deleteImagesUseCase);
