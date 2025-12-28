import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import EventsMiddleware from "../middlewares/EventsMiddleware";
import PlacesMiddleware from "../middlewares/PlacesMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import MongooseEventRepository from "../repositories/events/MongooseEventRepository";
import MongooseImageRepository from "../repositories/images/MongooseImageRepository";
import MongoosePlaceRepository from "../repositories/places/MongoosePlaceRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import MongoosePartnershipRepository from "../repositories/partnerships/MongoosePartnershipRepository";
import CreateEventAction from "../actions/events/CreateEventAction";
import UpdateEventAction from "../actions/events/UpdateEventAction";
import DeleteEventAction from "../actions/events/DeleteEventAction";
import GetEventByIdAction from "../actions/events/GetEventByIdAction";
import GetEventsAction from "../actions/events/GetEventsAction";
import CreateEventController from "../controllers/events/createEventController";
import UpdateEventController from "../controllers/events/updateEventController";
import DeleteEventController from "../controllers/events/deleteEventController";
import GetEventByIdController from "../controllers/events/getEventByIdController";
import GetEventsController from "../controllers/events/getEventsController";

// Initialize repositories
const eventRepository = new MongooseEventRepository();
const imageRepository = new MongooseImageRepository();
const placeRepository = new MongoosePlaceRepository();
const userRepository = new MongooseUserRepository();
const partnershipRepository = new MongoosePartnershipRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const eventsMiddleware = new EventsMiddleware(eventRepository, placeRepository);
const placesMiddleware = new PlacesMiddleware(placeRepository);
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createEventAction = new CreateEventAction(eventRepository);
const updateEventAction = new UpdateEventAction(eventRepository);
const deleteEventAction = new DeleteEventAction(
  eventRepository,
  imageRepository,
  partnershipRepository
);
const getEventByIdAction = new GetEventByIdAction(eventRepository);
const getEventsAction = new GetEventsAction(eventRepository);

// Initialize controllers
const createEventController = new CreateEventController(createEventAction);
const updateEventController = new UpdateEventController(updateEventAction);
const deleteEventController = new DeleteEventController(deleteEventAction);
const getEventByIdController = new GetEventByIdController(getEventByIdAction);
const getEventsController = new GetEventsController(getEventsAction);

const router: Router = express.Router();

// Routes
router.get("/", getEventsController.handle());
router.post(
  "/place/:placeId",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  createEventController.handle()
);
router.get("/:eventId", getEventByIdController.handle());
router.put(
  "/:eventId",
  authMiddleware.verify(),
  eventsMiddleware.ownership(),
  updateEventController.handle()
);
router.delete(
  "/:eventId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  eventsMiddleware.ownership(),
  deleteEventController.handle()
);

export default router;
