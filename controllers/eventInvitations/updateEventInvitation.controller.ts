import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IUpdateEventInvitationAction } from "@/actions/eventInvitations";

class UpdateEventInvitationController {
  constructor(
    private updateEventInvitationAction: IUpdateEventInvitationAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const { eventInvitations } = req.body;

        await this.updateEventInvitationAction.execute({
          eventInvitations,
          userId: decoded.id,
        });

        APIResponse(res, null, "Event invitations updated successfully", 200);
      } catch (error) {
        logger.error("Error updating event invitation:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update event invitation";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdateEventInvitationController;
