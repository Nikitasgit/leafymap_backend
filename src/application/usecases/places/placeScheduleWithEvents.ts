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
  image?: Record<string, unknown> | null;
}

interface SchedulePeriod {
  startDate: Date | string;
  endDate?: Date | string;
}

export interface EventForScheduleGrouping {
  _id: { toString(): string };
  name: string;
  schedule: SchedulePeriod[];
  image?: { toString(): string } | Record<string, unknown> | null;
  deleted?: boolean;
  status?: "cancelled" | "full" | "available";
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

/** True for unpopulated ObjectId-like refs (not a populated image document). */
function isObjectIdLike(value: object): boolean {
  if ("_bsontype" in value) {
    return true;
  }
  const keys = Object.keys(value);
  return (
    keys.length > 0 &&
    keys.every((k) => k === "id" || k === "buffer" || k === "_bsontype")
  );
}

function resolveEventImage(
  image: EventForScheduleGrouping["image"]
): Record<string, unknown> | null {
  if (!image || typeof image !== "object" || isObjectIdLike(image)) {
    return null;
  }
  return image as Record<string, unknown>;
}

/**
 * Groups place events onto weekdays for the current calendar week.
 * Pure helper — no I/O.
 */
export function groupEventsByDay(
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
          if (
            !eventsByDay[dayOfWeek].some((e) => e.id === event._id.toString())
          ) {
            eventsByDay[dayOfWeek].push({
              id: event._id.toString(),
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
