import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventListFilters } from "@src/domain/interfaces/IEventRepository";

export interface IGetEventsUseCase {
  execute(params: {
    filters?: EventListFilters;
  }): Promise<Record<string, unknown>[]>;
}

class GetEventsUseCase implements IGetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: {
    filters?: EventListFilters;
  }): Promise<Record<string, unknown>[]> {
    return this.eventRepository.findList(params.filters ?? {});
  }
}

export default GetEventsUseCase;
