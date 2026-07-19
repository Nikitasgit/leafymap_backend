import type DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteEventController = (
  deleteEventUseCase: DeleteEventUseCase
): Controller =>
  createController({
    execute: (req) =>
      deleteEventUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        actorId: requireAuth(req).id,
      }),
    successMessage: "Event deleted successfully",
  });

export default DeleteEventController;
