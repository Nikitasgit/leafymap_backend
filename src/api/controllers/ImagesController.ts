import { RequestHandler } from "express";
import {
  deleteImagesBodySchema,
  getImagesQuerySchema,
  uploadImagesBodySchema,
} from "@src/api/dto/images/image.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import type GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import type UploadImagesUseCase from "@src/application/usecases/images/UploadImages.usecase";
import { ERROR_CODES, ValidationError } from "@src/shared/errors";

class ImagesController extends BaseHttpController {
  constructor(
    private readonly uploadImagesUseCase: UploadImagesUseCase,
    private readonly getImagesUseCase: GetImagesUseCase,
    private readonly deleteImagesUseCase: DeleteImagesUseCase
  ) {
    super();
  }

  upload(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(uploadImagesBodySchema, req.body);
        const files = Array.isArray(req.files)
          ? req.files
          : req.files?.images;

        if (!files || files.length === 0) {
          throw new ValidationError(
            { images: "Aucune image fournie" },
            ERROR_CODES.IMAGE_NO_FILES,
            "Aucune image fournie"
          );
        }

        return this.uploadImagesUseCase.execute({
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
  }

  list(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const query = validateOrThrow(getImagesQuerySchema, req.query);
        return this.getImagesUseCase.execute({
          reference: query.reference,
          referenceType: query.referenceType,
          type: query.type,
          userId: query.user,
        });
      },
      successMessage: "Images récupérées avec succès",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(deleteImagesBodySchema, req.body);
        const imageIds = body.images.map((image) =>
          typeof image === "string" ? image : image.id
        );

        await this.deleteImagesUseCase.execute({
          imageIds,
          actorId: requireAuth(req).id,
        });
      },
      successMessage: "Images supprimées avec succès",
    });
  }
}

export default ImagesController;
