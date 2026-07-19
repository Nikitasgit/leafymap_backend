import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { GetEventsInViewInput } from "@src/application/dtos/events/getEventsInView.dto";

export const MAX_EVENTS_IN_VIEW = 100;

class GetEventsInViewUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: {
    filters: GetEventsInViewInput;
  }): Promise<Record<string, unknown>[]> {
    const limit = Math.min(
      params.filters.limit ?? MAX_EVENTS_IN_VIEW,
      MAX_EVENTS_IN_VIEW
    );

    return this.eventRepository.findInView({
      ne: params.filters.ne,
      sw: params.filters.sw,
      eventCategories: params.filters.eventCategories,
      startDate: params.filters.startDate,
      endDate: params.filters.endDate,
      limit,
    });
  }
}

export default GetEventsInViewUseCase;
