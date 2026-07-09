import { getEventInvitationsByUserIdQuerySchema } from "../../validations/eventInvitation.validations";
import { IGetEventInvitationsByUserIdAction } from "@/actions/eventInvitations";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetEventInvitationsByUserIdController = (
  getEventInvitationsByUserIdAction: IGetEventInvitationsByUserIdAction
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(
        getEventInvitationsByUserIdQuerySchema,
        req.query
      );
      return getEventInvitationsByUserIdAction.execute({
        filters: {
          userId: requireObjectIdParam(req, "userId"),
          asCollaborator: query.asCollaborator,
          includeCancelledEvents: query.includeCancelledEvents,
          includePastEvents: query.includePastEvents,
          currentUserId: req.decoded?.id,
          onlyAccepted: query.onlyAccepted,
          onlyPending: query.onlyPending,
        },
      });
    },
    successMessage: "Event invitations retrieved successfully",
  });

export default GetEventInvitationsByUserIdController;
