import {
  placeRepository,
  userRepository,
  eventRepository,
  cascadeDeleteService,
  authMiddleware as sharedAuthMiddleware,
  rateLimiterMiddleware as sharedRateLimiterMiddleware,
} from "./container";
import {
  CreatePlaceAction,
  UpdatePlaceAction,
  DeletePlaceAction,
  GetPlaceByIdAction,
  GetPlacesAction,
  GetPlacesInViewAction,
} from "@/actions/places";
import {
  CreatePlaceController,
  UpdatePlaceController,
  DeletePlaceController,
  GetPlaceByIdController,
  GetPlacesController,
  GetPlacesInViewController,
} from "@/controllers/places";
import { PlacesMiddleware } from "@/middlewares";

// Middlewares
export const authMiddleware = sharedAuthMiddleware;
export const placesMiddleware = new PlacesMiddleware(placeRepository);
export const rateLimiterMiddleware = sharedRateLimiterMiddleware;

// Actions
const createPlaceAction = new CreatePlaceAction(
  placeRepository,
  userRepository
);
const updatePlaceAction = new UpdatePlaceAction(placeRepository);
const deletePlaceAction = new DeletePlaceAction(
  placeRepository,
  userRepository,
  cascadeDeleteService
);
const getPlaceByIdAction = new GetPlaceByIdAction(
  placeRepository,
  eventRepository
);
const getPlacesAction = new GetPlacesAction(placeRepository);
const getPlacesInViewAction = new GetPlacesInViewAction(placeRepository);

// Controllers
export const createPlace = CreatePlaceController(createPlaceAction);
export const updatePlace = UpdatePlaceController(updatePlaceAction);
export const deletePlace = DeletePlaceController(deletePlaceAction);
export const getPlaceById = GetPlaceByIdController(getPlaceByIdAction);
export const getPlaces = GetPlacesController(getPlacesAction);
export const getPlacesInView = GetPlacesInViewController(
  getPlacesInViewAction
);
