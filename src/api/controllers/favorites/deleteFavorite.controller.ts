import { deleteFavoriteSchema } from "@src/api/dto/favorites/favorite.dto";
import type DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const DeleteFavoriteController = (
  deleteFavoriteUseCase: DeleteFavoriteUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { referenceId, referenceType } = validateOrThrow(
        deleteFavoriteSchema,
        req.body
      );
      await deleteFavoriteUseCase.execute({
        userId: requireAuth(req).id,
        referenceId,
        referenceType,
      });
    },
    successMessage: "Favori supprimé avec succès",
  });

export default DeleteFavoriteController;
