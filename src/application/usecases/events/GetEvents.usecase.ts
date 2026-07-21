import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventListItemReadModel } from "@src/domain/read-models/event.read-models";
import { GetEventsInput } from "@src/application/dtos/events/getEvents.dto";

class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: GetEventsInput): Promise<EventListItemReadModel[]> {
    return this.eventRepository.findList(params.filters ?? {});
  }
}

export default GetEventsUseCase;
