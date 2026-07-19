import { getEventInvitationsByUserIdQuerySchema } from "@src/api/dto/eventInvitations/eventInvitation.dto";
import type GetEventInvitationsByUserIdUseCase from "@src/application/usecases/eventInvitations/GetEventInvitationsByUserId.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetEventInvitationsByUserIdController = (
  getEventInvitationsByUserIdUseCase: GetEventInvitationsByUserIdUseCase
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(
        getEventInvitationsByUserIdQuerySchema,
        req.query
      );
      return getEventInvitationsByUserIdUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
        asCollaborator: query.asCollaborator,
        includeCancelledEvents: query.includeCancelledEvents,
        includePastEvents: query.includePastEvents,
        currentUserId: req.decoded?.id,
        onlyAccepted: query.onlyAccepted,
        onlyPending: query.onlyPending,
      });
    },
    successMessage: "Event invitations retrieved successfully",
  });

export default GetEventInvitationsByUserIdController;
