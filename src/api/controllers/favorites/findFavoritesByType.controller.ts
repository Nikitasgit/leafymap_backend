import { findFavoritesByTypeQuerySchema } from "@src/api/dto/favorites/favorite.dto";
import { IFindFavoritesByUserAndTypeUseCase } from "@src/application/usecases/favorites/FindFavoritesByUserAndType.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const FindFavoritesByTypeController = (
  findFavoritesByUserAndTypeUseCase: IFindFavoritesByUserAndTypeUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { referenceType } = validateOrThrow(
        findFavoritesByTypeQuerySchema,
        req.query
      );
      const output = await findFavoritesByUserAndTypeUseCase.execute({
        userId: requireAuth(req).id,
        referenceType,
      });
      return { ids: output.referenceIds };
    },
    successMessage: "Favoris récupérés avec succès",
  });

export default FindFavoritesByTypeController;
