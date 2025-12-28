import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { validatePlaceData } from "../../validations/placeValidations";
import { ICreatePlaceAction } from "../../actions/places/CreatePlaceAction";

class CreatePlaceController {
  constructor(private createPlaceAction: ICreatePlaceAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        if (!["creator", "organizer"].includes(decoded.userType)) {
          APIResponse(
            res,
            null,
            "Only creators and organizers can create places",
            403
          );
          return;
        }

        const validationResult = validatePlaceData(
          req.body,
          decoded.userType as "creator" | "organizer"
        );

        if (!validationResult.isValid) {
          APIResponse(res, validationResult.errors, "Validation failed", 400);
          return;
        }

        const place = await this.createPlaceAction.execute({
          placeData: req.body,
          userId: decoded.id,
          userType: decoded.userType as "creator" | "organizer",
        });

        APIResponse(res, place, "Place created successfully", 201);
      } catch (error) {
        logger.error("Error creating place:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create place";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreatePlaceController;
