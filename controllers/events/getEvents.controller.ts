import { getEventsQuerySchema } from "../../validations/event.validations";
import { IGetEventsAction } from "@/actions/events";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const GetEventsController = (getEventsAction: IGetEventsAction): Controller =>
  createController({
    execute: (req) =>
      getEventsAction.execute({
        filters: validateOrThrow(getEventsQuerySchema, req.query),
      }),
    successMessage: "Events fetched successfully",
  });

export default GetEventsController;
