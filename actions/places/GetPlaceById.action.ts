import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IPlace, IDaySchedule } from "@/types/models/place";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";
import ScheduleService, { EventForSchedule } from "@/services/scheduleService";

type EventPartial = Pick<
  IEvent,
  "_id" | "name" | "schedule" | "status" | "deleted" | "image"
>;

interface IDayScheduleWithEvents extends IDaySchedule {
  events?: EventForSchedule[];
}

interface IDefaultScheduleWithEvents {
  monday: IDayScheduleWithEvents;
  tuesday: IDayScheduleWithEvents;
  wednesday: IDayScheduleWithEvents;
  thursday: IDayScheduleWithEvents;
  friday: IDayScheduleWithEvents;
  saturday: IDayScheduleWithEvents;
  sunday: IDayScheduleWithEvents;
}

interface IPlaceWithEnrichedSchedule extends Omit<IPlace, "defaultSchedule"> {
  defaultSchedule?: IDefaultScheduleWithEvents;
}

export interface IGetPlaceByIdAction {
  execute(params: {
    placeId: string;
    project?: (keyof IPlace | string)[];
    scheduleWithEvents?: boolean;
  }): Promise<IPlace | IPlaceWithEnrichedSchedule>;
}

class GetPlaceByIdAction implements IGetPlaceByIdAction {
  private readonly defaultProject: (keyof IPlace | string)[] = [
    "_id",
    "location",
    "rating",
    "placeCategory",
    "placeType",
    "defaultSchedule",
    "customDates",
    "placeCategory.name",
    "user",
    "user.description",
    "user.username",
    "user.image.urls",
    "user.website",
    "user.userCategory",
    "user.userCategory.name",
    "user.userCategory.userCategoryType",
    "user.firstname",
    "user.lastname",
    "createdAt",
    "updatedAt",
  ];

  private scheduleService: ScheduleService;

  constructor(
    private placeRepository: IPlaceRepository,
    private eventRepository: IEventRepository
  ) {
    this.scheduleService = new ScheduleService();
  }

  async execute({
    placeId,
    project,
    scheduleWithEvents = false,
  }: {
    placeId: string;
    project?: (keyof IPlace | string)[];
    scheduleWithEvents?: boolean;
  }): Promise<IPlace | IPlaceWithEnrichedSchedule> {
    const place = await this.placeRepository.findById(
      placeId,
      project || this.defaultProject
    );

    if (!place) {
      throw new Error("Place not found");
    }

    if (!scheduleWithEvents || !place.defaultSchedule) {
      return place;
    }

    const weekRange = this.scheduleService.getCurrentWeekRange();

    const events = await this.eventRepository.findAll<
      "_id" | "name" | "schedule" | "status" | "deleted" | "image"
    >({
      filters: {
        place: placeId,
        deleted: false,
        dateRange: {
          start: weekRange.start,
          end: weekRange.end,
        },
      },
      project: ["_id", "name", "schedule", "status", "deleted", "image.urls"],
    });

    const eventsByDay = this.scheduleService.groupEventsByDay(
      events as EventPartial[]
    );

    const enrichedSchedule: IDefaultScheduleWithEvents = {
      monday: { ...place.defaultSchedule.monday, events: eventsByDay.monday },
      tuesday: {
        ...place.defaultSchedule.tuesday,
        events: eventsByDay.tuesday,
      },
      wednesday: {
        ...place.defaultSchedule.wednesday,
        events: eventsByDay.wednesday,
      },
      thursday: {
        ...place.defaultSchedule.thursday,
        events: eventsByDay.thursday,
      },
      friday: { ...place.defaultSchedule.friday, events: eventsByDay.friday },
      saturday: {
        ...place.defaultSchedule.saturday,
        events: eventsByDay.saturday,
      },
      sunday: { ...place.defaultSchedule.sunday, events: eventsByDay.sunday },
    };

    return {
      ...place,
      defaultSchedule: enrichedSchedule,
    } as IPlaceWithEnrichedSchedule;
  }
}

export default GetPlaceByIdAction;
