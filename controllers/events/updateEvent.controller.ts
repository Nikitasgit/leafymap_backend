import { updateEventSchema } from "@/validations/event.validations";
import { IUpdateEventAction } from "@/actions/events";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateEventController = (
  updateEventAction: IUpdateEventAction
): Controller =>
  createController({
    execute: async (req) => {
      const eventId = requireObjectIdParam(req, "eventId");
      await updateEventAction.execute({
        eventId,
        userId: requireAuth(req).id,
        updateData: validateOrThrow(updateEventSchema, req.body),
      });
      return { _id: eventId };
    },
    successMessage: "Event updated successfully",
  });

export default UpdateEventController;
