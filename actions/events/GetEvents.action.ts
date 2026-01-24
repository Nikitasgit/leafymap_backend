import {
  IEventRepository,
  EventFilters,
} from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";

export interface GetEventsInput {
  placeId?: string;
  limit?: number;
  lifecycleStatus?: ("upcoming" | "ongoing" | "completed" | "unvalid")[];
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
    "lifecycleStatus",
    "schedule",
    "dateRange",
    "image._id",
    "image.urls",
    "place._id",
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

    if (
      filters?.lifecycleStatus &&
      filters.lifecycleStatus.length > 0 &&
      filters.lifecycleStatus.some((status) => status.trim() !== "")
    ) {
      queryFilters.lifecycleStatus = {
        $in: filters.lifecycleStatus.filter((status) => status.trim() !== ""),
      };
    }

    const events = await this.eventRepository.findAll({
      filters: queryFilters,
      project: this.project,
      limit: filters?.limit || 100,
      sort: { "dateRange.firstDate": 1 },
    });

    return events;
  }
}

export default GetEventsAction;
