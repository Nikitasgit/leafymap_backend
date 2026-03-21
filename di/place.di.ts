import {
  PlaceRepository,
  UserRepository,
  ImageRepository,
  EventRepository,
  ReviewRepository,
  CommentRepository,
  FavoriteRepository,
} from "@/repositories";
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
import {
  AuthMiddleware,
  PlacesMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";

// Initialize repositories
const placeRepository = new PlaceRepository();
const userRepository = new UserRepository();
const imageRepository = new ImageRepository();
const eventRepository = new EventRepository();
const reviewRepository = new ReviewRepository();
const commentRepository = new CommentRepository();
const favoriteRepository = new FavoriteRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const placesMiddleware = new PlacesMiddleware(placeRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createPlaceAction = new CreatePlaceAction(
  placeRepository,
  userRepository
);
const updatePlaceAction = new UpdatePlaceAction(placeRepository);
const deletePlaceAction = new DeletePlaceAction(
  placeRepository,
  userRepository,
  imageRepository,
  eventRepository,
  reviewRepository,
  commentRepository,
  favoriteRepository
);
const getPlaceByIdAction = new GetPlaceByIdAction(
  placeRepository,
  eventRepository
);
const getPlacesAction = new GetPlacesAction(placeRepository);
const getPlacesInViewAction = new GetPlacesInViewAction(placeRepository);

// Initialize controllers
export const createPlace = new CreatePlaceController(createPlaceAction);
export const updatePlace = new UpdatePlaceController(updatePlaceAction);
export const deletePlace = new DeletePlaceController(deletePlaceAction);
export const getPlaceById = new GetPlaceByIdController(getPlaceByIdAction);
export const getPlaces = new GetPlacesController(getPlacesAction);
export const getPlacesInView = new GetPlacesInViewController(
  getPlacesInViewAction
);
