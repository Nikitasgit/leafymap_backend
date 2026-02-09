import {
  EventInvitationRepository,
  EventRepository,
  UserRepository,
} from "@/repositories";
import {
  CreateEventInvitationsAction,
  UpdateEventInvitationAction,
  GetEventInvitationsAction,
  GetEventInvitationsByUserIdAction,
} from "@/actions/eventInvitations";
import {
  CreateEventInvitationsController,
  UpdateEventInvitationController,
  GetEventInvitationsController,
  GetEventInvitationsByUserIdController,
} from "@/controllers/eventInvitations";
import { AuthMiddleware } from "@/middlewares";
import { notificationService } from "@/di/notification.di";
import EventInvitationService from "@/services/eventInvitationService";

const eventInvitationRepository = new EventInvitationRepository();
const eventRepository = new EventRepository();
const userRepository = new UserRepository();

export const eventInvitationService = new EventInvitationService(
  eventInvitationRepository,
  eventRepository
);

export const authMiddleware = new AuthMiddleware(userRepository);

const createEventInvitationsAction = new CreateEventInvitationsAction(
  eventInvitationRepository,
  notificationService
);
const updateEventInvitationAction = new UpdateEventInvitationAction(
  eventInvitationRepository,
  notificationService,
  eventInvitationService
);
const getEventInvitationsAction = new GetEventInvitationsAction(
  eventInvitationRepository
);
const getEventInvitationsByUserIdAction = new GetEventInvitationsByUserIdAction(
  eventInvitationRepository
);

export const createEventInvitations = new CreateEventInvitationsController(
  createEventInvitationsAction
);
export const updateEventInvitation = new UpdateEventInvitationController(
  updateEventInvitationAction
);
export const getEventInvitations = new GetEventInvitationsController(
  getEventInvitationsAction
);
export const getEventInvitationsByUserId =
  new GetEventInvitationsByUserIdController(getEventInvitationsByUserIdAction);
