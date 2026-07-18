import CreateEventInvitationsUseCase from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";
import GetEventInvitationsUseCase from "@src/application/usecases/eventInvitations/GetEventInvitations.usecase";
import GetEventInvitationsByUserIdUseCase from "@src/application/usecases/eventInvitations/GetEventInvitationsByUserId.usecase";
import CreateEventInvitationsController from "@src/api/controllers/eventInvitations/createEventInvitations.controller";
import UpdateEventInvitationController from "@src/api/controllers/eventInvitations/updateEventInvitation.controller";
import GetEventInvitationsController from "@src/api/controllers/eventInvitations/getEventInvitations.controller";
import GetEventInvitationsByUserIdController from "@src/api/controllers/eventInvitations/getEventInvitationsByUserId.controller";
import LegacyEventInvitationNotifierAdapter from "@src/infrastructure/adapters/LegacyEventInvitationNotifier.adapter";
import {
  authMiddleware,
  mongooseEventInvitationRepository,
  mongooseEventRepository,
} from "@/di/container";
import { notificationService } from "@/di/notification.di";

const eventInvitationNotifier = new LegacyEventInvitationNotifierAdapter(
  notificationService
);

const createEventInvitationsUseCase = new CreateEventInvitationsUseCase(
  mongooseEventInvitationRepository,
  mongooseEventRepository,
  eventInvitationNotifier
);
const updateEventInvitationUseCase = new UpdateEventInvitationUseCase(
  mongooseEventInvitationRepository,
  mongooseEventRepository,
  eventInvitationNotifier
);
const getEventInvitationsUseCase = new GetEventInvitationsUseCase(
  mongooseEventInvitationRepository
);
const getEventInvitationsByUserIdUseCase =
  new GetEventInvitationsByUserIdUseCase(mongooseEventInvitationRepository);

export { authMiddleware };

export const createEventInvitations = CreateEventInvitationsController(
  createEventInvitationsUseCase
);
export const updateEventInvitation = UpdateEventInvitationController(
  updateEventInvitationUseCase
);
export const getEventInvitations = GetEventInvitationsController(
  getEventInvitationsUseCase
);
export const getEventInvitationsByUserId =
  GetEventInvitationsByUserIdController(getEventInvitationsByUserIdUseCase);
