import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetMyEventBookingsAction } from "@/actions/eventBookings";

class GetMyEventBookingsController {
  constructor(private getMyEventBookingsAction: IGetMyEventBookingsAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;

        const eventBookings = await this.getMyEventBookingsAction.execute({
          userId: decoded.id,
        });

        APIResponse(
          res,
          eventBookings,
          "Réservations récupérées avec succès",
          200
        );
      } catch (error) {
        logger.error("Error getting my event bookings:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to get event bookings";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetMyEventBookingsController;
