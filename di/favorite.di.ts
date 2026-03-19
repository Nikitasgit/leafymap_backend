import { FavoriteRepository, UserRepository } from "@/repositories";
import {
  CreateFavoriteAction,
  DeleteFavoriteAction,
  FindFavoritesByUserAndTypeAction,
} from "@/actions/favorites";
import {
  CreateFavoriteController,
  DeleteFavoriteController,
  FindFavoritesByTypeController,
} from "@/controllers/favorites";
import { AuthMiddleware } from "@/middlewares";

// Initialize repositories
const favoriteRepository = new FavoriteRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);

// Initialize actions
const createFavoriteAction = new CreateFavoriteAction(favoriteRepository);
const deleteFavoriteAction = new DeleteFavoriteAction(favoriteRepository);
const findFavoritesByUserAndTypeAction = new FindFavoritesByUserAndTypeAction(
  favoriteRepository
);

// Initialize controllers
export const createFavorite = new CreateFavoriteController(
  createFavoriteAction
);
export const deleteFavorite = new DeleteFavoriteController(
  deleteFavoriteAction
);
export const findFavoritesByType = new FindFavoritesByTypeController(
  findFavoritesByUserAndTypeAction
);
