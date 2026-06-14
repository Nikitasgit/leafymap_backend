import {
  EventRepository,
  ImageRepository,
  PlaceRepository,
  UserRepository,
} from "@/repositories";
import {
  CreateEventAction,
  UpdateEventAction,
  DeleteEventAction,
  GetEventByIdAction,
  GetEventsAction,
} from "@/actions/events";
import {
  CreateEventController,
  UpdateEventController,
  DeleteEventController,
  GetEventByIdController,
  GetEventsController,
} from "@/controllers/events";
import {
  AuthMiddleware,
  EventsMiddleware,
  PlacesMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";

// Initialize repositories
const eventRepository = new EventRepository();
const imageRepository = new ImageRepository();
const placeRepository = new PlaceRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const eventsMiddleware = new EventsMiddleware(
  eventRepository,
  placeRepository
);
export const placesMiddleware = new PlacesMiddleware(placeRepository);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createEventAction = new CreateEventAction(eventRepository, placeRepository);
const updateEventAction = new UpdateEventAction(eventRepository, placeRepository);
const deleteEventAction = new DeleteEventAction(
  eventRepository,
  imageRepository
);
const getEventByIdAction = new GetEventByIdAction(eventRepository);
const getEventsAction = new GetEventsAction(eventRepository);

// Initialize controllers
export const createEvent = new CreateEventController(createEventAction);
export const updateEvent = new UpdateEventController(updateEventAction);
export const deleteEvent = new DeleteEventController(deleteEventAction);
export const getEventById = new GetEventByIdController(getEventByIdAction);
export const getEvents = new GetEventsController(getEventsAction);
