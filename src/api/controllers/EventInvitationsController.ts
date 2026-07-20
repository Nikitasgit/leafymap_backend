import { RequestHandler } from "express";
import {
  createEventInvitationsSchema,
  getEventInvitationsByUserIdQuerySchema,
  getEventInvitationsQuerySchema,
  updateEventInvitationsSchema,
} from "@src/api/dto/eventInvitations/eventInvitation.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateEventInvitationsUseCase from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import type GetEventInvitationsByUserIdUseCase from "@src/application/usecases/eventInvitations/GetEventInvitationsByUserId.usecase";
import type GetEventInvitationsUseCase from "@src/application/usecases/eventInvitations/GetEventInvitations.usecase";
import type UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";

class EventInvitationsController extends BaseHttpController {
  constructor(
    private readonly createEventInvitationsUseCase: CreateEventInvitationsUseCase,
    private readonly updateEventInvitationUseCase: UpdateEventInvitationUseCase,
    private readonly getEventInvitationsUseCase: GetEventInvitationsUseCase,
    private readonly getEventInvitationsByUserIdUseCase: GetEventInvitationsByUserIdUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(createEventInvitationsSchema, req.body);
        await this.createEventInvitationsUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          initiatorId: requireAuth(req).id,
          invitations: body.eventInvitations.map((invitation) => ({
            collaboratorId: invitation.collaborator._id,
          })),
        });
      },
      successMessage: "Event invitations created successfully",
      successStatus: 201,
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { onlyAccepted } = validateOrThrow(
          getEventInvitationsQuerySchema,
          req.query
        );
        return this.getEventInvitationsUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          currentUserId: req.decoded?.id,
          onlyAccepted,
        });
      },
      successMessage: "Event invitations retrieved successfully",
    });
  }

  listByUser(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const query = validateOrThrow(
          getEventInvitationsByUserIdQuerySchema,
          req.query
        );
        return this.getEventInvitationsByUserIdUseCase.execute({
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
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(updateEventInvitationsSchema, req.body);
        await this.updateEventInvitationUseCase.execute({
          userId: requireAuth(req).id,
          invitations: body.eventInvitations.map((invitation) => ({
            id: invitation._id,
            deleted: invitation.deleted,
            status: invitation.status,
          })),
        });
      },
      successMessage: "Event invitations updated successfully",
    });
  }
}

export default EventInvitationsController;
