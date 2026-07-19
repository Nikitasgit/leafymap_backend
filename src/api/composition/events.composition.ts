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
import PlaceOwnershipCheckerAdapter from "@src/infrastructure/adapters/PlaceOwnershipChecker.adapter";
import {
  authMiddleware,
  cascadeDeleteUseCase,
  mongooseEventBookingRepository,
  mongooseEventRepository,
  mongoosePlaceRepository,
  rateLimiterMiddleware,
} from "@src/di/container";

const placeOwnershipChecker = new PlaceOwnershipCheckerAdapter(
  mongoosePlaceRepository
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
  cascadeDeleteUseCase
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

export const createEvent = CreateEventController(createEventUseCase);
export const updateEvent = UpdateEventController(updateEventUseCase);
export const deleteEvent = DeleteEventController(deleteEventUseCase);
export const getEventById = GetEventByIdController(getEventByIdUseCase);
export const getEvents = GetEventsController(getEventsUseCase);
export const getEventsInView = GetEventsInViewController(
  getEventsInViewUseCase
);
