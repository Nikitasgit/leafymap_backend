import { RequestHandler } from "express";
import {
  createFavoriteSchema,
  deleteFavoriteSchema,
  getFavoritesByTypeQuerySchema,
} from "@src/api/dto/favorites/favorite.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import type DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import type GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";

class FavoritesController extends BaseHttpController {
  constructor(
    private readonly createFavoriteUseCase: CreateFavoriteUseCase,
    private readonly deleteFavoriteUseCase: DeleteFavoriteUseCase,
    private readonly getFavoritesByTypeUseCase: GetFavoritesByTypeUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { referenceId, referenceType } = validateOrThrow(
          createFavoriteSchema,
          req.body
        );
        return this.createFavoriteUseCase.execute({
          userId: requireAuth(req).id,
          referenceId,
          referenceType,
        });
      },
      successMessage: "Favori ajouté avec succès",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { referenceId, referenceType } = validateOrThrow(
          deleteFavoriteSchema,
          req.body
        );
        await this.deleteFavoriteUseCase.execute({
          userId: requireAuth(req).id,
          referenceId,
          referenceType,
        });
      },
      successMessage: "Favori supprimé avec succès",
    });
  }

  listByType(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { referenceType } = validateOrThrow(
          getFavoritesByTypeQuerySchema,
          req.query
        );
        const output = await this.getFavoritesByTypeUseCase.execute({
          userId: requireAuth(req).id,
          referenceType,
        });
        return { ids: output.referenceIds };
      },
      successMessage: "Favoris récupérés avec succès",
    });
  }
}

export default FavoritesController;
