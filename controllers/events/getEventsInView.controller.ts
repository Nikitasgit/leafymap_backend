import {
  GetEventsInViewInput,
  IGetEventsInViewAction,
} from "@/actions/events";
import { AppError } from "@/utils/errors";
import { Controller, createController } from "@/utils/controllerFactory";

const GetEventsInViewController = (
  getEventsInViewAction: IGetEventsInViewAction
): Controller =>
  createController({
    execute: async (req) => {
      const { ne, sw, filters: clientFilters, limit } = req.query;

      if (!ne || !sw || typeof ne !== "string" || typeof sw !== "string") {
        throw new AppError("Missing required coordinates", 400);
      }

      const inputFilters: GetEventsInViewInput = {
        ne: [],
        sw: [],
        clientFilters:
          typeof clientFilters === "string" ? clientFilters : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      try {
        inputFilters.ne = JSON.parse(ne);
        inputFilters.sw = JSON.parse(sw);
      } catch {
        throw new AppError("Invalid coordinate format", 400);
      }

      return getEventsInViewAction.execute({ filters: inputFilters });
    },
    successMessage: "Events fetched successfully",
  });

export default GetEventsInViewController;
