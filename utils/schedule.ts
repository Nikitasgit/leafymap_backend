/**
 * Utility functions for schedule management
 */

export interface ScheduleEvent {
  id: string;
  name: string;
}

export interface DaySchedule {
  open: boolean;
  timeSlots: any[];
  events?: ScheduleEvent[];
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export const isSameDayOfWeek = (date: Date, dayOfWeek: number): boolean => {
  return date.getDay() === dayOfWeek;
};

export const getCurrentWeekBounds = (): { monday: Date; sunday: Date } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

export const isWithinCurrentWeek = (date: Date): boolean => {
  const { monday, sunday } = getCurrentWeekBounds();
  return date >= monday && date <= sunday;
};

export const getDayNameFromDate = (date: Date): keyof WeekSchedule => {
  const dayNames: (keyof WeekSchedule)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return dayNames[date.getDay()];
};

export const eventOverlapsWithCurrentWeek = (
  eventSchedule: Array<{ startDate: Date; endDate: Date }>
): boolean => {
  const { monday, sunday } = getCurrentWeekBounds();

  return eventSchedule.some((period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    return periodStart <= sunday && periodEnd >= monday;
  });
};

export const getEventDatesInCurrentWeek = (
  eventSchedule: Array<{ startDate: Date; endDate: Date }>
): Date[] => {
  const { monday, sunday } = getCurrentWeekBounds();
  const dates: Date[] = [];

  eventSchedule.forEach((period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    if (periodStart <= sunday && periodEnd >= monday) {
      const startDate = periodStart > monday ? periodStart : monday;
      const endDate = periodEnd < sunday ? periodEnd : sunday;

      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  return dates;
};

export const enrichScheduleWithEvents = (
  defaultSchedule: WeekSchedule,
  events: Array<{
    _id: string;
    name: string;
    schedule: Array<{ startDate: Date; endDate: Date }>;
  }>
): WeekSchedule => {
  const enrichedSchedule = { ...defaultSchedule };

  const eventsByDay: Record<keyof WeekSchedule, ScheduleEvent[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  events.forEach((event) => {
    if (eventOverlapsWithCurrentWeek(event.schedule)) {
      const eventDates = getEventDatesInCurrentWeek(event.schedule);
      eventDates.forEach((date) => {
        const dayName = getDayNameFromDate(date);
        const eventExists = eventsByDay[dayName].some(
          (e) => e.id === event._id.toString()
        );
        if (!eventExists) {
          eventsByDay[dayName].push({
            id: event._id.toString(),
            name: event.name,
          });
        }
      });
    }
  });

  Object.keys(enrichedSchedule).forEach((day) => {
    const dayKey = day as keyof WeekSchedule;
    enrichedSchedule[dayKey] = {
      ...enrichedSchedule[dayKey],
      events: eventsByDay[dayKey],
    };
  });

  return enrichedSchedule;
};
