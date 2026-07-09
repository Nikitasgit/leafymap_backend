import { IDeleteEventAction } from "@/actions/events";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteEventController = (
  deleteEventAction: IDeleteEventAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteEventAction.execute({
        eventId: requireObjectIdParam(req, "eventId"),
      });
    },
    successMessage: "Event deleted successfully",
  });

export default DeleteEventController;
