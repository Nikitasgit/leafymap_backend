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

/**
 * Check if a given date matches a specific day of the week
 * @param date - The date to check
 * @param dayOfWeek - The day of the week (0-6, where 0 is Sunday)
 * @returns boolean - True if the date matches the day of the week
 */
export const isSameDayOfWeek = (date: Date, dayOfWeek: number): boolean => {
  return date.getDay() === dayOfWeek;
};

/**
 * Get the current week's Monday and Sunday dates
 * @returns object with monday and sunday dates
 */
export const getCurrentWeekBounds = (): { monday: Date; sunday: Date } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need to go back 6 days

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

/**
 * Check if a date falls within the current week (Monday to Sunday)
 * @param date - The date to check
 * @returns boolean - True if the date is within the current week
 */
export const isWithinCurrentWeek = (date: Date): boolean => {
  const { monday, sunday } = getCurrentWeekBounds();
  return date >= monday && date <= sunday;
};

/**
 * Get the day name from a date
 * @param date - The date
 * @returns string - The day name (monday, tuesday, etc.)
 */
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

/**
 * Check if an event's schedule overlaps with the current week
 * @param eventSchedule - Array of event periods with startDate and endDate
 * @returns boolean - True if any period overlaps with current week
 */
export const eventOverlapsWithCurrentWeek = (
  eventSchedule: Array<{ startDate: Date; endDate: Date }>
): boolean => {
  const { monday, sunday } = getCurrentWeekBounds();

  return eventSchedule.some((period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    // Check if the period overlaps with the current week
    return periodStart <= sunday && periodEnd >= monday;
  });
};

/**
 * Get all dates from an event's schedule that fall within the current week
 * @param eventSchedule - Array of event periods with startDate and endDate
 * @returns Date[] - Array of dates that fall within the current week
 */
export const getEventDatesInCurrentWeek = (
  eventSchedule: Array<{ startDate: Date; endDate: Date }>
): Date[] => {
  const { monday, sunday } = getCurrentWeekBounds();
  const dates: Date[] = [];

  eventSchedule.forEach((period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    // If period overlaps with current week, add all dates in the overlap
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

/**
 * Enrich a place's schedule with events for the current week
 * @param defaultSchedule - The place's default schedule
 * @param events - Array of events with schedule and other properties
 * @returns WeekSchedule - The enriched schedule with events
 */
export const enrichScheduleWithEvents = (
  defaultSchedule: WeekSchedule,
  events: Array<{
    _id: string;
    name: string;
    schedule: Array<{ startDate: Date; endDate: Date }>;
  }>
): WeekSchedule => {
  const enrichedSchedule = { ...defaultSchedule };

  // Initialize events by day
  const eventsByDay: Record<keyof WeekSchedule, ScheduleEvent[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  // Process each event
  events.forEach((event) => {
    // Check if event overlaps with current week
    if (eventOverlapsWithCurrentWeek(event.schedule)) {
      // Get all dates from this event that fall within current week
      const eventDates = getEventDatesInCurrentWeek(event.schedule);

      // Add event to each day it occurs
      eventDates.forEach((date) => {
        const dayName = getDayNameFromDate(date);
        // Check if event is not already added to this day
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

  // Add events to each day's schedule
  Object.keys(enrichedSchedule).forEach((day) => {
    const dayKey = day as keyof WeekSchedule;
    enrichedSchedule[dayKey] = {
      ...enrichedSchedule[dayKey],
      events: eventsByDay[dayKey],
    };
  });

  return enrichedSchedule;
};
