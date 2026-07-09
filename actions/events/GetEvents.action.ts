import {
  IEventRepository,
  EventFilters,
} from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";

export interface GetEventsInput {
  placeId?: string;
  userId?: string;
  search?: string;
  limit?: number;
  lifecycleStatus?: ("upcoming" | "ongoing" | "completed" | "unvalid")[];
  sortBy?: "createdAt" | "dateRange.firstDate";
  order?: "asc" | "desc";
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
    "eventCategory",
    "eventCategory.name",
    "place",
    "user",
    "location",
    "online",
    "description",
    "status",
    "lifecycleStatus",
    "schedule",
    "dateRange",
    "isBookable",
    "capacity",
    "maxSeatsPerBooking",
    "image._id",
    "image.urls",
    "place._id",
    "place.location",
    "place.user",
    "place.user.username",
    "user._id",
    "user.username",
    "user.image",
    "user.image.urls",
  ];

  constructor(private eventRepository: IEventRepository) {}

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

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

    if (filters?.userId) {
      queryFilters.user = filters.userId;
    }

    if (filters?.search?.trim()) {
      queryFilters.name = {
        $regex: this.escapeRegex(filters.search.trim()),
        $options: "i",
      };
      queryFilters.status = { $ne: "cancelled" };
    }

    if (
      filters?.lifecycleStatus &&
      filters.lifecycleStatus.length > 0 &&
      filters.lifecycleStatus.some((status) => status.trim() !== "")
    ) {
      queryFilters.lifecycleStatus = {
        $in: filters.lifecycleStatus.filter((status) => status.trim() !== ""),
      };
    } else if (filters?.search?.trim()) {
      queryFilters.lifecycleStatus = { $in: ["upcoming", "ongoing"] };
    }

    const sortBy = filters?.sortBy || "dateRange.firstDate";
    const order = filters?.order === "desc" ? -1 : 1;
    const sort: { [key: string]: 1 | -1 } = { [sortBy]: order };

    const events = await this.eventRepository.findAll({
      filters: queryFilters,
      project: this.project,
      limit: filters?.limit || 100,
      sort,
    });

    return events;
  }
}

export default GetEventsAction;
