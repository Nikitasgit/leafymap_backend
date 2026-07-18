import { createEventInvitationsSchema } from "@src/api/dto/eventInvitations/eventInvitation.dto";
import { ICreateEventInvitationsUseCase } from "@src/application/usecases/eventInvitations/CreateEventInvitations.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateEventInvitationsController = (
  createEventInvitationsUseCase: ICreateEventInvitationsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(createEventInvitationsSchema, req.body);
      await createEventInvitationsUseCase.execute({
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

export default CreateEventInvitationsController;
