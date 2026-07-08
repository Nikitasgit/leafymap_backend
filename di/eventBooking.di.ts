import {
  EventBookingRepository,
  EventRepository,
  UserRepository,
} from "@/repositories";
import {
  CreateEventBookingAction,
  UpdateEventBookingAction,
  CancelEventBookingAction,
  GetEventBookingsByEventAction,
  GetMyEventBookingsAction,
  GetMyEventBookingForEventAction,
} from "@/actions/eventBookings";
import {
  CreateEventBookingController,
  UpdateEventBookingController,
  CancelEventBookingController,
  GetEventBookingsByEventController,
  GetMyEventBookingsController,
  GetMyEventBookingForEventController,
} from "@/controllers/eventBookings";
import { AuthMiddleware, EventBookingMiddleware } from "@/middlewares";
import { notificationService } from "@/di/notification.di";

const eventBookingRepository = new EventBookingRepository();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

export const authMiddleware = new AuthMiddleware(userRepository);
export const eventBookingMiddleware = new EventBookingMiddleware(
  eventBookingRepository,
  eventRepository
);

const createEventBookingAction = new CreateEventBookingAction(
  eventBookingRepository,
  eventRepository
);
const updateEventBookingAction = new UpdateEventBookingAction(
  eventBookingRepository,
  eventRepository,
  notificationService
);
const cancelEventBookingAction = new CancelEventBookingAction(
  eventBookingRepository,
  eventRepository,
  notificationService
);
const getEventBookingsByEventAction = new GetEventBookingsByEventAction(
  eventBookingRepository
);
const getMyEventBookingsAction = new GetMyEventBookingsAction(
  eventBookingRepository
);
const getMyEventBookingForEventAction = new GetMyEventBookingForEventAction(
  eventBookingRepository
);

export const createEventBooking = new CreateEventBookingController(
  createEventBookingAction
);
export const updateEventBooking = new UpdateEventBookingController(
  updateEventBookingAction
);
export const cancelEventBooking = new CancelEventBookingController(
  cancelEventBookingAction
);
export const getEventBookingsByEvent = new GetEventBookingsByEventController(
  getEventBookingsByEventAction
);
export const getMyEventBookings = new GetMyEventBookingsController(
  getMyEventBookingsAction
);
export const getMyEventBookingForEvent =
  new GetMyEventBookingForEventController(getMyEventBookingForEventAction);
