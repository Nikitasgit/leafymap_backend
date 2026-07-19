import { deleteImagesBodySchema } from "@src/api/dto/images/image.dto";
import type DeleteImagesUseCase from "@src/application/usecases/images/DeleteImages.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const DeleteImagesController = (
  deleteImagesUseCase: DeleteImagesUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(deleteImagesBodySchema, req.body);
      const imageIds = body.images.map((image) =>
        typeof image === "string" ? image : image._id
      );

      await deleteImagesUseCase.execute({
        imageIds,
        actorId: requireAuth(req).id,
      });
    },
    successMessage: "Images supprimées avec succès",
  });

export default DeleteImagesController;
