import { IUpdateEventInvitationAction } from "@/actions/eventInvitations";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const UpdateEventInvitationController = (
  updateEventInvitationAction: IUpdateEventInvitationAction
): Controller =>
  createController({
    execute: async (req) => {
      await updateEventInvitationAction.execute({
        eventInvitations: req.body.eventInvitations,
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Event invitations updated successfully",
  });

export default UpdateEventInvitationController;
