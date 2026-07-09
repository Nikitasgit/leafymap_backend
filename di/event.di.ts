import {
  eventRepository,
  eventBookingRepository,
  placeRepository,
  cascadeDeleteService,
  authMiddleware as sharedAuthMiddleware,
  rateLimiterMiddleware as sharedRateLimiterMiddleware,
} from "./container";
import {
  CreateEventAction,
  UpdateEventAction,
  DeleteEventAction,
  GetEventByIdAction,
  GetEventsAction,
  GetEventsInViewAction,
} from "@/actions/events";
import {
  CreateEventController,
  UpdateEventController,
  DeleteEventController,
  GetEventByIdController,
  GetEventsController,
  GetEventsInViewController,
} from "@/controllers/events";
import { EventsMiddleware, PlacesMiddleware } from "@/middlewares";

// Middlewares
export const authMiddleware = sharedAuthMiddleware;
export const eventsMiddleware = new EventsMiddleware(eventRepository);
export const placesMiddleware = new PlacesMiddleware(placeRepository);
export const rateLimiterMiddleware = sharedRateLimiterMiddleware;

// Actions
const createEventAction = new CreateEventAction(eventRepository, placeRepository);
const updateEventAction = new UpdateEventAction(eventRepository, placeRepository);
const deleteEventAction = new DeleteEventAction(
  eventRepository,
  cascadeDeleteService
);
const getEventByIdAction = new GetEventByIdAction(
  eventRepository,
  eventBookingRepository
);
const getEventsAction = new GetEventsAction(eventRepository);
const getEventsInViewAction = new GetEventsInViewAction(eventRepository);

// Controllers
export const createEvent = CreateEventController(createEventAction);
export const updateEvent = UpdateEventController(updateEventAction);
export const deleteEvent = DeleteEventController(deleteEventAction);
export const getEventById = GetEventByIdController(getEventByIdAction);
export const getEvents = GetEventsController(getEventsAction);
export const getEventsInView = GetEventsInViewController(
  getEventsInViewAction
);
