import { getEventsQuerySchema } from "@src/api/dto/events/event.dto";
import { IGetEventsUseCase } from "@src/application/usecases/events/GetEvents.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetEventsController = (
  getEventsUseCase: IGetEventsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getEventsUseCase.execute({
        filters: validateOrThrow(getEventsQuerySchema, req.query),
      }),
    successMessage: "Events fetched successfully",
  });

export default GetEventsController;
