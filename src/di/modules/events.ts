import { asClass, AwilixContainer } from "awilix";
import EventsController from "@src/api/controllers/EventsController";
import CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import GetEventByIdUseCase from "@src/application/usecases/events/GetEventById.usecase";
import GetEventsUseCase from "@src/application/usecases/events/GetEvents.usecase";
import GetEventsInViewUseCase from "@src/application/usecases/events/GetEventsInView.usecase";
import UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";
import UpdateEventLifecycleStatusUseCase from "@src/application/usecases/events/UpdateEventLifecycleStatus.usecase";
import PlaceOwnershipCheckerAdapter from "@src/infrastructure/adapters/PlaceOwnershipChecker.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerEventsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    placeOwnershipChecker: asClass(PlaceOwnershipCheckerAdapter).singleton(),
    createEventUseCase: asClass(CreateEventUseCase).singleton(),
    updateEventUseCase: asClass(UpdateEventUseCase).singleton(),
    deleteEventUseCase: asClass(DeleteEventUseCase).singleton(),
    getEventByIdUseCase: asClass(GetEventByIdUseCase).singleton(),
    getEventsUseCase: asClass(GetEventsUseCase).singleton(),
    getEventsInViewUseCase: asClass(GetEventsInViewUseCase).singleton(),
    updateEventLifecycleStatusUseCase: asClass(
      UpdateEventLifecycleStatusUseCase
    ).singleton(),

    eventsController: asClass(EventsController).singleton(),
  });
};
