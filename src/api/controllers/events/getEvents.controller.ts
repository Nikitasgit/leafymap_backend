import { getEventsQuerySchema } from "@src/api/dto/events/event.dto";
import type GetEventsUseCase from "@src/application/usecases/events/GetEvents.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetEventsController = (
  getEventsUseCase: GetEventsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getEventsUseCase.execute({
        filters: validateOrThrow(getEventsQuerySchema, req.query),
      }),
    successMessage: "Events fetched successfully",
  });

export default GetEventsController;
