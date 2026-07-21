import { EventScheduleSummaryReadModel } from "@src/domain/read-models/event.read-models";
import { ImageReferenceReadModel } from "@src/domain/read-models/shared.read-models";

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
  image?: ImageReferenceReadModel | null;
}

function getDayOfWeek(date: Date): WeekDay {
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

export function getCurrentWeekRange(): { start: Date; end: Date } {
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

function getDatesBetween(startDate: Date, endDate: Date): Date[] {
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

function resolveEventImage(
  image: EventScheduleSummaryReadModel["image"]
): ImageReferenceReadModel | null {
  if (!image || typeof image === "string") {
    return null;
  }
  return image;
}

/**
 * Groups place events onto weekdays for the current calendar week.
 * Pure helper — no I/O.
 */
export function groupEventsByDay(
  events: EventScheduleSummaryReadModel[]
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

  const weekRange = getCurrentWeekRange();

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
        const dates = getDatesBetween(intersectionStart, intersectionEnd);

        dates.forEach((date) => {
          const dayOfWeek = getDayOfWeek(date);
          if (!eventsByDay[dayOfWeek].some((e) => e.id === event.id)) {
            eventsByDay[dayOfWeek].push({
              id: event.id,
              name: event.name,
              image: resolveEventImage(event.image),
            });
          }
        });
      }
    });
  });

  return eventsByDay;
}
