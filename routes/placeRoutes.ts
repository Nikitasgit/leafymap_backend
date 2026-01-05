import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import PlacesMiddleware from "../middlewares/PlacesMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import MongooseImageRepository from "../repositories/images/MongooseImageRepository";
import MongooseEventRepository from "../repositories/events/MongooseEventRepository";
import MongoosePartnershipRepository from "../repositories/partnerships/MongoosePartnershipRepository";
import CreatePlaceAction from "../actions/places/CreatePlaceAction";
import UpdatePlaceAction from "../actions/places/UpdatePlaceAction";
import DeletePlaceAction from "../actions/places/DeletePlaceAction";
import GetPlaceByIdAction from "../actions/places/GetPlaceByIdAction";
import GetPlacesAction from "../actions/places/GetPlacesAction";
import GetPlacesInViewAction from "../actions/places/GetPlacesInViewAction";
import CreatePlaceController from "../controllers/places/createPlaceController";
import UpdatePlaceController from "../controllers/places/updatePlaceController";
import DeletePlaceController from "../controllers/places/deletePlaceController";
import GetPlaceByIdController from "../controllers/places/getPlaceByIdController";
import GetPlacesController from "../controllers/places/getPlacesController";
import GetPlacesInViewController from "../controllers/places/getPlacesInViewController";

// Initialize repositories
const placeRepository = new MongoosePlaceRepository();
const userRepository = new MongooseUserRepository();
const imageRepository = new MongooseImageRepository();
const eventRepository = new MongooseEventRepository();
const partnershipRepository = new MongoosePartnershipRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const placesMiddleware = new PlacesMiddleware(placeRepository);
const rateLimiterMiddleware = new RateLimiterMiddleware();

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
  partnershipRepository
);
const getPlaceByIdAction = new GetPlaceByIdAction(
  placeRepository,
  eventRepository
);
const getPlacesAction = new GetPlacesAction(placeRepository);
const getPlacesInViewAction = new GetPlacesInViewAction(placeRepository);

// Initialize controllers
const createPlaceController = new CreatePlaceController(createPlaceAction);
const updatePlaceController = new UpdatePlaceController(updatePlaceAction);
const deletePlaceController = new DeletePlaceController(deletePlaceAction);
const getPlaceByIdController = new GetPlaceByIdController(getPlaceByIdAction);
const getPlacesBySearchController = new GetPlacesController(getPlacesAction);
const getPlacesInViewController = new GetPlacesInViewController(
  getPlacesInViewAction
);

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createPlaceController.handle());
router.put(
  "/:placeId",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  updatePlaceController.handle()
);
router.delete(
  "/:placeId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  placesMiddleware.ownership(),
  deletePlaceController.handle()
);
router.get("/search", getPlacesBySearchController.handle());
router.get("/in-view", getPlacesInViewController.handle());
router.get("/:placeId", getPlaceByIdController.handle());

export default router;
