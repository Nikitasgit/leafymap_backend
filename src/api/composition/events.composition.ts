import CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";
import DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import GetEventByIdUseCase from "@src/application/usecases/events/GetEventById.usecase";
import GetEventsUseCase from "@src/application/usecases/events/GetEvents.usecase";
import GetEventsInViewUseCase from "@src/application/usecases/events/GetEventsInView.usecase";
import UpdateEventLifecycleStatusUseCase from "@src/application/usecases/events/UpdateEventLifecycleStatus.usecase";
import CreateEventController from "@src/api/controllers/events/createEvent.controller";
import UpdateEventController from "@src/api/controllers/events/updateEvent.controller";
import DeleteEventController from "@src/api/controllers/events/deleteEvent.controller";
import GetEventByIdController from "@src/api/controllers/events/getEventById.controller";
import GetEventsController from "@src/api/controllers/events/getEvents.controller";
import GetEventsInViewController from "@src/api/controllers/events/getEventsInView.controller";
import LegacyPlaceOwnershipCheckerAdapter from "@src/infrastructure/adapters/LegacyPlaceOwnershipChecker.adapter";
import {
  authMiddleware,
  cascadeDeleteService,
  mongooseEventBookingRepository,
  mongooseEventRepository,
  placeRepository,
  rateLimiterMiddleware,
} from "@/di/container";
import { EventsMiddleware, PlacesMiddleware } from "@/middlewares";

const placeOwnershipChecker = new LegacyPlaceOwnershipCheckerAdapter(
  placeRepository
);

const createEventUseCase = new CreateEventUseCase(
  mongooseEventRepository,
  placeOwnershipChecker
);
const updateEventUseCase = new UpdateEventUseCase(
  mongooseEventRepository,
  placeOwnershipChecker
);
const deleteEventUseCase = new DeleteEventUseCase(
  mongooseEventRepository,
  cascadeDeleteService
);
const getEventByIdUseCase = new GetEventByIdUseCase(
  mongooseEventRepository,
  mongooseEventBookingRepository
);
const getEventsUseCase = new GetEventsUseCase(mongooseEventRepository);
const getEventsInViewUseCase = new GetEventsInViewUseCase(
  mongooseEventRepository
);
export const updateEventLifecycleStatusUseCase =
  new UpdateEventLifecycleStatusUseCase(mongooseEventRepository);

export { authMiddleware, rateLimiterMiddleware };
export const placesMiddleware = new PlacesMiddleware(placeRepository);
export const eventsMiddleware = new EventsMiddleware(mongooseEventRepository);

export const createEvent = CreateEventController(createEventUseCase);
export const updateEvent = UpdateEventController(updateEventUseCase);
export const deleteEvent = DeleteEventController(deleteEventUseCase);
export const getEventById = GetEventByIdController(getEventByIdUseCase);
export const getEvents = GetEventsController(getEventsUseCase);
export const getEventsInView = GetEventsInViewController(
  getEventsInViewUseCase
);
