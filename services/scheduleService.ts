import { IEventPeriod } from "../types/models/event";
import { IImage } from "../types/models/Image";
import { Types } from "mongoose";

type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface EventForSchedule {
  id: string;
  name: string;
  image?: Partial<IImage> | null;
}

type EventForScheduleGrouping = {
  _id: { toString(): string };
  name: string;
  schedule: IEventPeriod[];
  image?: Types.ObjectId | Partial<IImage> | null;
  deleted?: boolean;
  status?: "cancelled" | "full" | "available";
};

class ScheduleService {
  private getDayOfWeek(date: Date): WeekDay {
    const day = date.getDay();
    const days: WeekDay[] = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[day];
  }

  getCurrentWeekRange(): { start: Date; end: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }

  private getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  groupEventsByDay(
    events: EventForScheduleGrouping[]
  ): Record<WeekDay, EventForSchedule[]> {
    const eventsByDay: Record<WeekDay, EventForSchedule[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    const weekRange = this.getCurrentWeekRange();

    const eventsThisWeek = events.filter(
      (event) => !event.deleted && event.status !== "cancelled"
    );

    eventsThisWeek.forEach((event) => {
      event.schedule.forEach((period) => {
        const eventStart = new Date(period.startDate);
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = period.endDate ? new Date(period.endDate) : eventStart;
        eventEnd.setHours(0, 0, 0, 0);

        const intersectionStart =
          eventStart > weekRange.start ? eventStart : weekRange.start;
        const intersectionEnd =
          eventEnd < weekRange.end ? eventEnd : weekRange.end;

        if (intersectionStart <= intersectionEnd) {
          const dates = this.getDatesBetween(
            intersectionStart,
            intersectionEnd
          );

          dates.forEach((date) => {
            const dayOfWeek = this.getDayOfWeek(date);
            if (
              !eventsByDay[dayOfWeek].some((e) => e.id === event._id.toString())
            ) {
              const eventImage =
                event.image &&
                typeof event.image === "object" &&
                !(event.image instanceof Types.ObjectId)
                  ? (event.image as Partial<IImage>)
                  : null;
              eventsByDay[dayOfWeek].push({
                id: event._id.toString(),
                name: event.name,
                image: eventImage,
              });
            }
          });
        }
      });
    });

    return eventsByDay;
  }
}

export default ScheduleService;
