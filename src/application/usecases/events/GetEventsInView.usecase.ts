import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { parseJson } from "@/utils/jsonHandlers";

export const MAX_EVENTS_IN_VIEW = 100;

export interface GetEventsInViewInput {
  ne: number[];
  sw: number[];
  clientFilters?: string;
  limit?: number;
}

interface ClientFilters {
  eventCategories?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

const CLIENT_FILTERS_DEFAULTS: ClientFilters = {
  eventCategories: [],
  startDate: null,
  endDate: null,
};

export interface IGetEventsInViewUseCase {
  execute(params: {
    filters: GetEventsInViewInput;
  }): Promise<Record<string, unknown>[]>;
}

class GetEventsInViewUseCase implements IGetEventsInViewUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: {
    filters: GetEventsInViewInput;
  }): Promise<Record<string, unknown>[]> {
    const clientFilters = parseJson<ClientFilters>(
      params.filters.clientFilters,
      CLIENT_FILTERS_DEFAULTS
    );
    const limit = Math.min(
      params.filters.limit ?? MAX_EVENTS_IN_VIEW,
      MAX_EVENTS_IN_VIEW
    );

    return this.eventRepository.findInView({
      ne: params.filters.ne,
      sw: params.filters.sw,
      eventCategories: clientFilters.eventCategories,
      startDate: clientFilters.startDate,
      endDate: clientFilters.endDate,
      limit,
    });
  }
}

export default GetEventsInViewUseCase;
