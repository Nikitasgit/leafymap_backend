import CreatePlaceUseCase from "@src/application/usecases/places/CreatePlace.usecase";
import UpdatePlaceUseCase from "@src/application/usecases/places/UpdatePlace.usecase";
import DeletePlaceUseCase from "@src/application/usecases/places/DeletePlace.usecase";
import GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import GetPlacesUseCase from "@src/application/usecases/places/GetPlaces.usecase";
import GetPlacesInViewUseCase from "@src/application/usecases/places/GetPlacesInView.usecase";
import CreatePlaceController from "@src/api/controllers/places/createPlace.controller";
import UpdatePlaceController from "@src/api/controllers/places/updatePlace.controller";
import DeletePlaceController from "@src/api/controllers/places/deletePlace.controller";
import GetPlaceByIdController from "@src/api/controllers/places/getPlaceById.controller";
import GetPlacesController from "@src/api/controllers/places/getPlaces.controller";
import GetPlacesInViewController from "@src/api/controllers/places/getPlacesInView.controller";
import {
  authMiddleware,
  cascadeDeleteUseCase,
  mongooseEventRepository,
  mongoosePlaceRepository,
  rateLimiterMiddleware,
  userPlaceLinker,
} from "@src/di/container";

const createPlaceUseCase = new CreatePlaceUseCase(
  mongoosePlaceRepository,
  userPlaceLinker
);
const updatePlaceUseCase = new UpdatePlaceUseCase(mongoosePlaceRepository);
const deletePlaceUseCase = new DeletePlaceUseCase(
  mongoosePlaceRepository,
  userPlaceLinker,
  cascadeDeleteUseCase
);
const getPlaceByIdUseCase = new GetPlaceByIdUseCase(
  mongoosePlaceRepository,
  mongooseEventRepository
);
const getPlacesUseCase = new GetPlacesUseCase(mongoosePlaceRepository);
const getPlacesInViewUseCase = new GetPlacesInViewUseCase(
  mongoosePlaceRepository
);

export { authMiddleware, rateLimiterMiddleware };

export const createPlace = CreatePlaceController(createPlaceUseCase);
export const updatePlace = UpdatePlaceController(updatePlaceUseCase);
export const deletePlace = DeletePlaceController(deletePlaceUseCase);
export const getPlaceById = GetPlaceByIdController(getPlaceByIdUseCase);
export const getPlaces = GetPlacesController(getPlacesUseCase);
export const getPlacesInView = GetPlacesInViewController(getPlacesInViewUseCase);
