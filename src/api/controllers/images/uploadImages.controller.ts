import { uploadImagesBodySchema } from "@src/api/dto/images/image.dto";
import type UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import { AppError, ERROR_CODES } from "@src/shared/errors";

const UploadImagesController = (
  uploadImagesUseCase: UploadImagesUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(uploadImagesBodySchema, req.body);
      const files = Array.isArray(req.files)
        ? req.files
        : req.files?.images;

      if (!files || files.length === 0) {
        throw new AppError(
          ERROR_CODES.IMAGE_NO_FILES,
          400,
          "Aucune image fournie"
        );
      }

      return uploadImagesUseCase.execute({
        userId: requireAuth(req).id,
        reference: body.reference,
        referenceType: body.referenceType,
        type: body.type,
        files: files.map((file: Express.Multer.File) => ({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        })),
      });
    },
    successMessage: "Images uploadées et créées avec succès",
  });

export default UploadImagesController;
