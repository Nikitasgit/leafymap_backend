import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { PlaceDetailsReadModel } from "@src/domain/read-models/place.read-models";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { PlaceId } from "@src/domain/value-objects/ObjectId.vo";
import {
  PlaceDaySchedule,
  PlaceDefaultSchedule,
} from "@src/domain/value-objects/PlaceSchedule.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";
import { GetPlaceByIdInput } from "@src/application/dtos/places/getPlaceById.dto";
import {
  EventForSchedule,
  EventForScheduleGrouping,
  getCurrentWeekRange,
  groupEventsByDay,
} from "@src/application/usecases/places/placeScheduleWithEvents";

interface PlaceDayScheduleWithEvents extends PlaceDaySchedule {
  events?: EventForSchedule[];
}

interface PlaceDefaultScheduleWithEvents {
  monday: PlaceDayScheduleWithEvents;
  tuesday: PlaceDayScheduleWithEvents;
  wednesday: PlaceDayScheduleWithEvents;
  thursday: PlaceDayScheduleWithEvents;
  friday: PlaceDayScheduleWithEvents;
  saturday: PlaceDayScheduleWithEvents;
  sunday: PlaceDayScheduleWithEvents;
}

class GetPlaceByIdUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(
    params: GetPlaceByIdInput
  ): Promise<PlaceDetailsReadModel> {
    const placeId = PlaceId.from(params.placeId);
    const place = await this.placeRepository.findDetailsById(placeId);

    if (!place || place.deleted === true) {
      throw new NotFoundError(
        ERROR_CODES.PLACE_NOT_FOUND,
        "Place not found"
      );
    }

    if (!params.scheduleWithEvents || !place.defaultSchedule) {
      return place;
    }

    const defaultSchedule = place.defaultSchedule as PlaceDefaultSchedule;
    const weekRange = getCurrentWeekRange();
    const events = await this.eventRepository.findByPlaceInDateRange(
      placeId,
      weekRange.start,
      weekRange.end
    );

    const eventsByDay = groupEventsByDay(
      events as unknown as EventForScheduleGrouping[]
    );

    const enrichedSchedule: PlaceDefaultScheduleWithEvents = {
      monday: { ...defaultSchedule.monday, events: eventsByDay.monday },
      tuesday: { ...defaultSchedule.tuesday, events: eventsByDay.tuesday },
      wednesday: {
        ...defaultSchedule.wednesday,
        events: eventsByDay.wednesday,
      },
      thursday: { ...defaultSchedule.thursday, events: eventsByDay.thursday },
      friday: { ...defaultSchedule.friday, events: eventsByDay.friday },
      saturday: { ...defaultSchedule.saturday, events: eventsByDay.saturday },
      sunday: { ...defaultSchedule.sunday, events: eventsByDay.sunday },
    };

    return {
      ...place,
      defaultSchedule: enrichedSchedule,
    };
  }
}

export default GetPlaceByIdUseCase;
