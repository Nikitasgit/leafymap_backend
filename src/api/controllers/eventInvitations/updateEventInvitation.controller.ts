import { updateEventInvitationsSchema } from "@src/api/dto/eventInvitations/eventInvitation.dto";
import type UpdateEventInvitationUseCase from "@src/application/usecases/eventInvitations/UpdateEventInvitation.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateEventInvitationController = (
  updateEventInvitationUseCase: UpdateEventInvitationUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(updateEventInvitationsSchema, req.body);
      await updateEventInvitationUseCase.execute({
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

export default UpdateEventInvitationController;
