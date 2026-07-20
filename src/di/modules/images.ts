import { asClass, AwilixContainer } from "awilix";
import { UploadMiddleware } from "@src/api/middlewares";
import ImagesController from "@src/api/controllers/ImagesController";
import GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import ImageReferenceOwnershipCheckerAdapter from "@src/infrastructure/adapters/ImageReferenceOwnershipChecker.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerImagesModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    ownershipChecker: asClass(
      ImageReferenceOwnershipCheckerAdapter
    ).singleton(),
    uploadImagesUseCase: asClass(UploadImagesUseCase).singleton(),
    getImagesUseCase: asClass(GetImagesUseCase).singleton(),
    uploadMiddleware: asClass(UploadMiddleware).singleton(),

    imagesController: asClass(ImagesController).singleton(),
  });
};
