import CreateEventBookingUseCase from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import UpdateEventBookingUseCase from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";
import CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import GetMyEventBookingsUseCase from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import GetMyEventBookingForEventUseCase from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import CreateEventBookingController from "@src/api/controllers/eventBookings/createEventBooking.controller";
import UpdateEventBookingController from "@src/api/controllers/eventBookings/updateEventBooking.controller";
import CancelEventBookingController from "@src/api/controllers/eventBookings/cancelEventBooking.controller";
import GetMyEventBookingsController from "@src/api/controllers/eventBookings/getMyEventBookings.controller";
import GetMyEventBookingForEventController from "@src/api/controllers/eventBookings/getMyEventBookingForEvent.controller";
import GetEventBookingsByEventController from "@src/api/controllers/eventBookings/getEventBookingsByEvent.controller";
import LegacyEventNotifierAdapter from "@src/infrastructure/adapters/LegacyEventNotifier.adapter";
import {
  authMiddleware,
  mongooseEventBookingRepository,
  mongooseEventRepository,
} from "@/di/container";
import { notificationService } from "@/di/notification.di";

const eventNotifier = new LegacyEventNotifierAdapter(notificationService);

const createEventBookingUseCase = new CreateEventBookingUseCase(
  mongooseEventBookingRepository,
  mongooseEventRepository
);
const updateEventBookingUseCase = new UpdateEventBookingUseCase(
  mongooseEventBookingRepository,
  mongooseEventRepository,
  eventNotifier
);
const cancelEventBookingUseCase = new CancelEventBookingUseCase(
  mongooseEventBookingRepository,
  mongooseEventRepository,
  eventNotifier
);
const getMyEventBookingsUseCase = new GetMyEventBookingsUseCase(
  mongooseEventBookingRepository
);
const getMyEventBookingForEventUseCase = new GetMyEventBookingForEventUseCase(
  mongooseEventBookingRepository
);
const getEventBookingsByEventUseCase = new GetEventBookingsByEventUseCase(
  mongooseEventBookingRepository,
  mongooseEventRepository
);

export { authMiddleware };

export const createEventBooking = CreateEventBookingController(
  createEventBookingUseCase
);
export const updateEventBooking = UpdateEventBookingController(
  updateEventBookingUseCase
);
export const cancelEventBooking = CancelEventBookingController(
  cancelEventBookingUseCase
);
export const getMyEventBookings = GetMyEventBookingsController(
  getMyEventBookingsUseCase
);
export const getMyEventBookingForEvent = GetMyEventBookingForEventController(
  getMyEventBookingForEventUseCase
);
export const getEventBookingsByEvent = GetEventBookingsByEventController(
  getEventBookingsByEventUseCase
);
