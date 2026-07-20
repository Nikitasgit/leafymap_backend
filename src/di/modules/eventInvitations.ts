import { asClass, AwilixContainer } from "awilix";
import EventInvitationsController from "@src/api/controllers/EventInvitationsController";
import CreateEventInvitationsUseCase from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import GetEventInvitationsByUserIdUseCase from "@src/application/usecases/eventInvitations/GetEventInvitationsByUserId.usecase";
import GetEventInvitationsUseCase from "@src/application/usecases/eventInvitations/GetEventInvitations.usecase";
import UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";
import EventInvitationNotifierAdapter from "@src/infrastructure/adapters/EventInvitationNotifier.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerEventInvitationsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    eventInvitationNotifier: asClass(
      EventInvitationNotifierAdapter
    ).singleton(),
    createEventInvitationsUseCase: asClass(
      CreateEventInvitationsUseCase
    ).singleton(),
    updateEventInvitationUseCase: asClass(
      UpdateEventInvitationUseCase
    ).singleton(),
    getEventInvitationsUseCase: asClass(GetEventInvitationsUseCase).singleton(),
    getEventInvitationsByUserIdUseCase: asClass(
      GetEventInvitationsByUserIdUseCase
    ).singleton(),

    eventInvitationsController: asClass(EventInvitationsController).singleton(),
  });
};
