import { asClass, AwilixContainer } from "awilix";
import EventBookingsController from "@src/api/controllers/EventBookingsController";
import CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import CreateEventBookingUseCase from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import GetMyEventBookingForEventUseCase from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import GetMyEventBookingsUseCase from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import UpdateEventBookingUseCase from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";
import EventNotifierAdapter from "@src/infrastructure/adapters/EventNotifier.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerEventBookingsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    eventNotifier: asClass(EventNotifierAdapter).singleton(),
    createEventBookingUseCase: asClass(CreateEventBookingUseCase).singleton(),
    updateEventBookingUseCase: asClass(UpdateEventBookingUseCase).singleton(),
    cancelEventBookingUseCase: asClass(CancelEventBookingUseCase).singleton(),
    getMyEventBookingsUseCase: asClass(GetMyEventBookingsUseCase).singleton(),
    getMyEventBookingForEventUseCase: asClass(
      GetMyEventBookingForEventUseCase
    ).singleton(),
    getEventBookingsByEventUseCase: asClass(
      GetEventBookingsByEventUseCase
    ).singleton(),

    eventBookingsController: asClass(EventBookingsController).singleton(),
  });
};
