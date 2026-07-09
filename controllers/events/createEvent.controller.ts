import { newEventSchema } from "../../validations/event.validations";
import { ICreateEventAction } from "@/actions/events";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateEventController = (
  createEventAction: ICreateEventAction
): Controller =>
  createController({
    execute: (req) => {
      const decoded = requireAuth(req);
      const body = { ...req.body };
      if (req.placeId) {
        body.place = req.placeId;
      }
      const eventData = validateOrThrow(newEventSchema, body);
      return createEventAction.execute({
        eventData: {
          ...eventData,
          user: decoded.id,
        },
      });
    },
    successMessage: "Event created successfully",
    successStatus: 201,
  });

export default CreateEventController;
