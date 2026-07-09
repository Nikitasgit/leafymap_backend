import { getEventInvitationsQuerySchema } from "../../validations/eventInvitation.validations";
import { IGetEventInvitationsAction } from "@/actions/eventInvitations";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetEventInvitationsController = (
  getEventInvitationsAction: IGetEventInvitationsAction
): Controller =>
  createController({
    execute: (req) => {
      const { onlyAccepted } = validateOrThrow(
        getEventInvitationsQuerySchema,
        req.query
      );
      return getEventInvitationsAction.execute({
        filters: {
          eventId: requireObjectIdParam(req, "eventId"),
          currentUserId: req.decoded?.id,
          onlyAccepted,
        },
      });
    },
    successMessage: "Event invitations retrieved successfully",
  });

export default GetEventInvitationsController;
