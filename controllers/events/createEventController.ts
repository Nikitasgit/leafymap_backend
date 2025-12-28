import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { ICreateEventAction } from "../../actions/events/CreateEventAction";
import { validateEventData } from "../../validations/eventValidations";
import { Types } from "mongoose";

class CreateEventController {
  constructor(private createEventAction: ICreateEventAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const placeId = new Types.ObjectId(req.placeId!);
        console.log(req.body);
        const validationResult = validateEventData(req.body, false);
        if (!validationResult.isValid) {
          APIResponse(res, validationResult.errors, "Validation failed", 400);
          return;
        }
        req.body.place = placeId;
        const event = await this.createEventAction.execute({
          eventData: req.body,
        });

        APIResponse(res, event, "Event created successfully", 201);
      } catch (error) {
        logger.error("Error creating event:", error);
        const message =
          error instanceof Error ? error.message : "Failed to create event";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default CreateEventController;
