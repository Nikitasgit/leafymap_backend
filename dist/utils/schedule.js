"use strict";
/**
 * Utility functions for schedule management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichScheduleWithEvents = exports.getEventDatesInCurrentWeek = exports.eventOverlapsWithCurrentWeek = exports.getDayNameFromDate = exports.isWithinCurrentWeek = exports.getCurrentWeekBounds = exports.isSameDayOfWeek = void 0;
const isSameDayOfWeek = (date, dayOfWeek) => {
    return date.getDay() === dayOfWeek;
};
exports.isSameDayOfWeek = isSameDayOfWeek;
const getCurrentWeekBounds = () => {
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
exports.getCurrentWeekBounds = getCurrentWeekBounds;
const isWithinCurrentWeek = (date) => {
    const { monday, sunday } = (0, exports.getCurrentWeekBounds)();
    return date >= monday && date <= sunday;
};
exports.isWithinCurrentWeek = isWithinCurrentWeek;
const getDayNameFromDate = (date) => {
    const dayNames = [
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
exports.getDayNameFromDate = getDayNameFromDate;
const eventOverlapsWithCurrentWeek = (eventSchedule) => {
    const { monday, sunday } = (0, exports.getCurrentWeekBounds)();
    return eventSchedule.some((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return periodStart <= sunday && periodEnd >= monday;
    });
};
exports.eventOverlapsWithCurrentWeek = eventOverlapsWithCurrentWeek;
const getEventDatesInCurrentWeek = (eventSchedule) => {
    const { monday, sunday } = (0, exports.getCurrentWeekBounds)();
    const dates = [];
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
exports.getEventDatesInCurrentWeek = getEventDatesInCurrentWeek;
const enrichScheduleWithEvents = (defaultSchedule, events) => {
    const enrichedSchedule = { ...defaultSchedule };
    const eventsByDay = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    };
    events.forEach((event) => {
        if ((0, exports.eventOverlapsWithCurrentWeek)(event.schedule)) {
            const eventDates = (0, exports.getEventDatesInCurrentWeek)(event.schedule);
            eventDates.forEach((date) => {
                const dayName = (0, exports.getDayNameFromDate)(date);
                const eventExists = eventsByDay[dayName].some((e) => e.id === event._id.toString());
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
        const dayKey = day;
        enrichedSchedule[dayKey] = {
            ...enrichedSchedule[dayKey],
            events: eventsByDay[dayKey],
        };
    });
    return enrichedSchedule;
};
exports.enrichScheduleWithEvents = enrichScheduleWithEvents;
