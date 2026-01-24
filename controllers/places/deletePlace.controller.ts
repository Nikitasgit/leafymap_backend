import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IDeletePlaceAction } from "@/actions/places";

class DeletePlaceController {
  constructor(private deletePlaceAction: IDeletePlaceAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const placeId = req.placeId!;
        const decoded = req.decoded!;

        await this.deletePlaceAction.execute({
          placeId,
          userId: decoded.id,
        });

        APIResponse(
          res,
          null,
          "Place and associated events deleted successfully",
          200
        );
      } catch (error) {
        logger.error("Error deleting place:", error);
        const message =
          error instanceof Error ? error.message : "Failed to delete place";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default DeletePlaceController;
