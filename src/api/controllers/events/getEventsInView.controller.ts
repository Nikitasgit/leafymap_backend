import { getEventsInViewQuerySchema } from "@src/api/dto/events/event.dto";
import type GetEventsInViewUseCase from "@src/application/usecases/events/GetEventsInView.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetEventsInViewController = (
  getEventsInViewUseCase: GetEventsInViewUseCase
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(getEventsInViewQuerySchema, req.query);
      return getEventsInViewUseCase.execute({
        filters: {
          ne: query.ne,
          sw: query.sw,
          eventCategories: query.filters.eventCategories,
          startDate: query.filters.startDate,
          endDate: query.filters.endDate,
          limit: query.limit,
        },
      });
    },
    successMessage: "Events fetched successfully",
  });

export default GetEventsInViewController;
