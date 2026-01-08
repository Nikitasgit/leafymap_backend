import { IEventPeriod, IEventDateRange } from "../types/models/event";

export type LifecycleStatus = "upcoming" | "ongoing" | "completed" | "unvalid";

class EventStatusService {
  getEventDateRange(schedule: IEventPeriod[]): IEventDateRange {
    if (!schedule || schedule.length === 0) {
      return { firstDate: new Date(0), latestDate: new Date(0) };
    }

    const allDates: Date[] = [];
    schedule.forEach((period) => {
      if (period.startDate) {
        allDates.push(new Date(period.startDate));
      }
      if (period.endDate) {
        allDates.push(new Date(period.endDate));
      }
    });

    if (allDates.length === 0) {
      return { firstDate: new Date(0), latestDate: new Date(0) };
    }

    if (allDates.length === 1) {
      return { firstDate: allDates[0], latestDate: allDates[0] };
    }

    const sortedDates = allDates.sort((a, b) => a.getTime() - b.getTime());

    return {
      firstDate: sortedDates[0],
      latestDate: sortedDates[sortedDates.length - 1],
    };
  }

  getLifecycleStatus(dateRange: IEventDateRange): LifecycleStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!dateRange.firstDate || dateRange.firstDate.getTime() === 0) {
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
  }
  calculateEventStatus(schedule: IEventPeriod[]): {
    dateRange: IEventDateRange;
    lifecycleStatus: LifecycleStatus;
  } {
    const dateRange = this.getEventDateRange(schedule);
    const lifecycleStatus = this.getLifecycleStatus(dateRange);

    return {
      dateRange,
      lifecycleStatus,
    };
  }
}

export default EventStatusService;
