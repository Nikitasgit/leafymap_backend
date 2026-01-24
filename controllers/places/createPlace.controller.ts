import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { newPlaceSchema } from "../../validations/place.validations";
import { ICreatePlaceAction } from "@/actions/places";
import { validateData } from "@/utils/validation";

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
        if (decoded.userType !== "creator") {
          APIResponse(res, null, "Only creators can create places", 403);
          return;
        }

        const errors = validateData(newPlaceSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const place = await this.createPlaceAction.execute({
          placeData: req.body,
          userId: decoded.id,
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
