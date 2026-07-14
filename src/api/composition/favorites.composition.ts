import CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import FindFavoritesByUserAndTypeUseCase from "@src/application/usecases/favorites/FindFavoritesByUserAndType.usecase";
import CreateFavoriteController from "@src/api/controllers/favorites/createFavorite.controller";
import DeleteFavoriteController from "@src/api/controllers/favorites/deleteFavorite.controller";
import FindFavoritesByTypeController from "@src/api/controllers/favorites/findFavoritesByType.controller";
import {
  authMiddleware,
  mongooseFavoriteRepository,
} from "@/di/container";

const createFavoriteUseCase = new CreateFavoriteUseCase(mongooseFavoriteRepository);
const deleteFavoriteUseCase = new DeleteFavoriteUseCase(mongooseFavoriteRepository);
const findFavoritesByUserAndTypeUseCase = new FindFavoritesByUserAndTypeUseCase(
  mongooseFavoriteRepository
);

export { authMiddleware };

export const createFavorite = CreateFavoriteController(createFavoriteUseCase);
export const deleteFavorite = DeleteFavoriteController(deleteFavoriteUseCase);
export const findFavoritesByType = FindFavoritesByTypeController(
  findFavoritesByUserAndTypeUseCase
);
