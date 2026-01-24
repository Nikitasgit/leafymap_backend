import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { ICreateEventAction } from "@/actions/events";
import { newEventSchema } from "../../validations/event.validations";
import { Types } from "mongoose";
import { validateData } from "@/utils/validation";

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
        const errors = validateData(newEventSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
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
