import { getImagesQuerySchema } from "@src/api/dto/images/image.dto";
import type GetImagesUseCase from "@src/application/usecases/images/GetImages.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetImagesController = (getImagesUseCase: GetImagesUseCase): Controller =>
  createController({
    execute: async (req) => {
      const query = validateOrThrow(getImagesQuerySchema, req.query);
      return getImagesUseCase.execute({
        reference: query.reference,
        referenceType: query.referenceType,
        type: query.type,
        userId: query.user,
      });
    },
    successMessage: "Images récupérées avec succès",
  });

export default GetImagesController;
