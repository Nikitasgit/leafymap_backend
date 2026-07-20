import { asClass, AwilixContainer } from "awilix";
import FavoritesController from "@src/api/controllers/FavoritesController";
import CreateFavoriteUseCase from "@src/application/usecases/favorites/CreateFavorite.usecase";
import DeleteFavoriteUseCase from "@src/application/usecases/favorites/DeleteFavorite.usecase";
import GetFavoritesByTypeUseCase from "@src/application/usecases/favorites/GetFavoritesByType.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerFavoritesModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    createFavoriteUseCase: asClass(CreateFavoriteUseCase).singleton(),
    deleteFavoriteUseCase: asClass(DeleteFavoriteUseCase).singleton(),
    getFavoritesByTypeUseCase: asClass(GetFavoritesByTypeUseCase).singleton(),

    favoritesController: asClass(FavoritesController).singleton(),
  });
};
