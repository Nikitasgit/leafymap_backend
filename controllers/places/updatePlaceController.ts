import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { validatePlaceData } from "../../validations/placeValidations";
import { IUpdatePlaceAction } from "../../actions/places/UpdatePlaceAction";

class UpdatePlaceController {
  constructor(private updatePlaceAction: IUpdatePlaceAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const placeId = req.placeId!;
        const decoded = req.decoded!;

        const validationResult = validatePlaceData(req.body, true);

        if (!validationResult.isValid) {
          APIResponse(res, validationResult.errors, "Validation failed", 400);
          return;
        }

        await this.updatePlaceAction.execute({
          placeId,
          updateData: req.body,
          userId: decoded.id,
        });

        APIResponse(res, null, "Place updated successfully", 200);
      } catch (error) {
        logger.error("Error updating place:", error);
        const message =
          error instanceof Error ? error.message : "Failed to update place";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default UpdatePlaceController;
