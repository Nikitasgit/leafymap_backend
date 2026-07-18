import { EventInvitationRepository, UserRepository } from "@/repositories";
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
import { mongooseEventRepository } from "@/di/container";
import EventInvitationService from "@/services/eventInvitationService";

const eventInvitationRepository = new EventInvitationRepository();
const userRepository = new UserRepository();

export const eventInvitationService = new EventInvitationService(
  eventInvitationRepository,
  mongooseEventRepository
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

export const createEventInvitations = CreateEventInvitationsController(
  createEventInvitationsAction
);
export const updateEventInvitation = UpdateEventInvitationController(
  updateEventInvitationAction
);
export const getEventInvitations = GetEventInvitationsController(
  getEventInvitationsAction
);
export const getEventInvitationsByUserId =
  GetEventInvitationsByUserIdController(getEventInvitationsByUserIdAction);
