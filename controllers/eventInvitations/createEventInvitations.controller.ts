import { ICreateEventInvitationsAction } from "@/actions/eventInvitations";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const CreateEventInvitationsController = (
  createEventInvitationsAction: ICreateEventInvitationsAction
): Controller =>
  createController({
    execute: async (req) => {
      await createEventInvitationsAction.execute({
        eventInvitations: req.body.eventInvitations,
        eventId: requireObjectIdParam(req, "eventId"),
        initiatorId: requireAuth(req).id,
      });
    },
    successMessage: "Event invitations created successfully",
    successStatus: 201,
  });

export default CreateEventInvitationsController;
