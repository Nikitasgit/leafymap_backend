import type GetEventByIdUseCase from "@src/application/usecases/events/GetEventById.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetEventByIdController = (
  getEventByIdUseCase: GetEventByIdUseCase
): Controller =>
  createController({
    execute: (req) =>
      getEventByIdUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
      }),
    successMessage: "Event fetched successfully",
  });

export default GetEventByIdController;
