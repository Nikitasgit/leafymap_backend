import { getEventInvitationsQuerySchema } from "@src/api/dto/eventInvitations/eventInvitation.dto";
import type GetEventInvitationsUseCase from "@src/application/usecases/eventInvitations/GetEventInvitations.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetEventInvitationsController = (
  getEventInvitationsUseCase: GetEventInvitationsUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { onlyAccepted } = validateOrThrow(
        getEventInvitationsQuerySchema,
        req.query
      );
      return getEventInvitationsUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        currentUserId: req.decoded?.id,
        onlyAccepted,
      });
    },
    successMessage: "Event invitations retrieved successfully",
  });

export default GetEventInvitationsController;
