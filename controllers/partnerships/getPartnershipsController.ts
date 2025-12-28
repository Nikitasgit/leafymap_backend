import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetPartnershipsAction } from "../../actions/partnerships/GetPartnershipsAction";

class GetPartnershipsController {
  constructor(private getPartnershipsAction: IGetPartnershipsAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { placeId, eventId } = req.params;
        const { onlyAccepted, type } = req.query;

        const partnerships = await this.getPartnershipsAction.execute({
          filters: {
            placeId,
            eventId: eventId as string | undefined,
            type: type as "place" | "event" | undefined,
            onlyAccepted: onlyAccepted === "true",
          },
        });

        APIResponse(
          res,
          partnerships,
          "Partnerships retrieved successfully",
          200
        );
      } catch (error) {
        logger.error("Error getting partnerships by place id:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get partnerships by place id";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPartnershipsController;
