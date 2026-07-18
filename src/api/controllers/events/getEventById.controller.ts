import { IGetEventByIdUseCase } from "@src/application/usecases/events/GetEventById.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetEventByIdController = (
  getEventByIdUseCase: IGetEventByIdUseCase
): Controller =>
  createController({
    execute: (req) =>
      getEventByIdUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
      }),
    successMessage: "Event fetched successfully",
  });

export default GetEventByIdController;
