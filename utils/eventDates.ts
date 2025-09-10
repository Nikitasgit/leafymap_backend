import { IEventPeriod } from "../types/models/event";

interface EventDates {
  firstDate: string;
  latestDate: string;
}

export const getEventDateRange = (schedule: IEventPeriod[]): EventDates => {
  if (!schedule || schedule.length === 0) {
    return { firstDate: "", latestDate: "" };
  }

  const allDates: string[] = [];
  schedule.forEach((period) => {
    if (period.startDate) {
      allDates.push(period.startDate.toISOString().split("T")[0]);
    }
    if (period.endDate) {
      allDates.push(period.endDate.toISOString().split("T")[0]);
    }
  });

  if (allDates.length === 0) {
    return { firstDate: "", latestDate: "" };
  }

  if (allDates.length === 1) {
    return { firstDate: allDates[0], latestDate: "" };
  }

  const sortedDates = allDates.sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return {
    firstDate: sortedDates[0],
    latestDate: sortedDates[sortedDates.length - 1],
  };
};

export const getEventStatusFromSchedule = (
  schedule: IEventPeriod[]
): "upcoming" | "ongoing" | "completed" | "unvalid" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateRange = getEventDateRange(schedule);

  if (!dateRange.firstDate) {
    return "unvalid";
  }

  const firstDate = new Date(dateRange.firstDate);
  const latestDate = dateRange.latestDate
    ? new Date(dateRange.latestDate)
    : firstDate;

  firstDate.setHours(0, 0, 0, 0);
  latestDate.setHours(0, 0, 0, 0);

  if (firstDate <= today && today <= latestDate) {
    return "ongoing";
  }

  if (firstDate > today) {
    return "upcoming";
  }

  if (latestDate < today) {
    return "completed";
  }

  return "unvalid";
};
