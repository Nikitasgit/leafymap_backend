import { IGetEventByIdAction } from "@/actions/events";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetEventByIdController = (
  getEventByIdAction: IGetEventByIdAction
): Controller =>
  createController({
    execute: (req) =>
      getEventByIdAction.execute({
        eventId: requireObjectIdParam(req, "eventId"),
      }),
    successMessage: "Event fetched successfully",
  });

export default GetEventByIdController;
