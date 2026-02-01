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

const eventInvitationRepository = new EventInvitationRepository();
const userRepository = new UserRepository();

export const authMiddleware = new AuthMiddleware(userRepository);

const createEventInvitationsAction = new CreateEventInvitationsAction(
  eventInvitationRepository
);
const updateEventInvitationAction = new UpdateEventInvitationAction(
  eventInvitationRepository
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
