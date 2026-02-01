import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreateEventInvitationsAction } from "@/actions/eventInvitations";

class CreateEventInvitationsController {
  constructor(
    private createEventInvitationsAction: ICreateEventInvitationsAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { eventId } = req.params;
        const { eventInvitations } = req.body;

        await this.createEventInvitationsAction.execute({
          eventInvitations,
          eventId,
          initiatorId: decoded.id,
        });

        APIResponse(
          res,
          null,
          "Event invitations created successfully",
          201
        );
      } catch (error) {
        logger.error("Error creating event invitation:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to create event invitation";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreateEventInvitationsController;
