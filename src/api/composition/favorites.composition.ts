import CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";
import CreateFavoriteController from "@src/api/controllers/favorites/createFavorite.controller";
import DeleteFavoriteController from "@src/api/controllers/favorites/deleteFavorite.controller";
import GetFavoritesByTypeController from "@src/api/controllers/favorites/getFavoritesByType.controller";
import {
  authMiddleware,
  mongooseFavoriteRepository,
} from "@src/di/container";

const createFavoriteUseCase = new CreateFavoriteUseCase(mongooseFavoriteRepository);
const deleteFavoriteUseCase = new DeleteFavoriteUseCase(mongooseFavoriteRepository);
const getFavoritesByTypeUseCase = new GetFavoritesByTypeUseCase(
  mongooseFavoriteRepository
);

export { authMiddleware };

export const createFavorite = CreateFavoriteController(createFavoriteUseCase);
export const deleteFavorite = DeleteFavoriteController(deleteFavoriteUseCase);
export const getFavoritesByType = GetFavoritesByTypeController(
  getFavoritesByTypeUseCase
);
