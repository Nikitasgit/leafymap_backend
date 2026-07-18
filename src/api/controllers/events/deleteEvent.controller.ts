import { IDeleteEventUseCase } from "@src/application/usecases/events/DeleteEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteEventController = (
  deleteEventUseCase: IDeleteEventUseCase
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
