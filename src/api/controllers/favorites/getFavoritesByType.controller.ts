import { getFavoritesByTypeQuerySchema } from "@src/api/dto/favorites/favorite.dto";
import type GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetFavoritesByTypeController = (
  getFavoritesByTypeUseCase: GetFavoritesByTypeUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { referenceType } = validateOrThrow(
        getFavoritesByTypeQuerySchema,
        req.query
      );
      const output = await getFavoritesByTypeUseCase.execute({
        userId: requireAuth(req).id,
        referenceType,
      });
      return { ids: output.referenceIds };
    },
    successMessage: "Favoris récupérés avec succès",
  });

export default GetFavoritesByTypeController;
