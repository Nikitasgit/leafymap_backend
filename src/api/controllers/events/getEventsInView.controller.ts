import { getEventsInViewQuerySchema } from "@src/api/dto/events/event.dto";
import { IGetEventsInViewUseCase } from "@src/application/usecases/events/GetEventsInView.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetEventsInViewController = (
  getEventsInViewUseCase: IGetEventsInViewUseCase
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(getEventsInViewQuerySchema, req.query);
      return getEventsInViewUseCase.execute({
        filters: {
          ne: query.ne,
          sw: query.sw,
          clientFilters: query.filters,
          limit: query.limit,
        },
      });
    },
    successMessage: "Events fetched successfully",
  });

export default GetEventsInViewController;
