import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { GetEventsInput } from "@src/application/dtos/events/getEvents.dto";

class GetEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(params: GetEventsInput): Promise<Record<string, unknown>[]> {
    return this.eventRepository.findList(params.filters ?? {});
  }
}

export default GetEventsUseCase;
