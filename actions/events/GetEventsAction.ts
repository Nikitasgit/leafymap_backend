import {
  IEventRepository,
  EventFilters,
} from "../../repositories/events/IEventRepository";
import { IEvent } from "../../types/models/event";

export interface GetEventsInput {
  placeId?: string;
  limit?: number;
}

export interface IGetEventsAction {
  execute(params: {
    filters?: GetEventsInput;
  }): Promise<IEvent[] | Partial<IEvent>[]>;
}

class GetEventsAction implements IGetEventsAction {
  private readonly project: (keyof IEvent | string)[] = [
    "_id",
    "name",
    "image",
    "place",
    "description",
    "status",
    "schedule",
    "image._id",
    "image.urls",
    "place._id",
    "place.name",
  ];

  constructor(private eventRepository: IEventRepository) {}

  async execute({
    filters,
  }: {
    filters?: GetEventsInput;
  }): Promise<IEvent[] | Partial<IEvent>[]> {
    const queryFilters: EventFilters = {
      deleted: false,
    };

    if (filters?.placeId) {
      queryFilters.place = filters.placeId;
    }

    const events = await this.eventRepository.findAll({
      filters: queryFilters,
      project: this.project,
      limit: filters?.limit || 100,
    });

    return events;
  }
}

export default GetEventsAction;
