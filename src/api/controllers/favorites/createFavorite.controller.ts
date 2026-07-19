import { createFavoriteSchema } from "@src/api/dto/favorites/favorite.dto";
import type CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateFavoriteController = (
  createFavoriteUseCase: CreateFavoriteUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { referenceId, referenceType } = validateOrThrow(
        createFavoriteSchema,
        req.body
      );
      return createFavoriteUseCase.execute({
        userId: requireAuth(req).id,
        referenceId,
        referenceType,
      });
    },
    successMessage: "Favori ajouté avec succès",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateFavoriteController;
