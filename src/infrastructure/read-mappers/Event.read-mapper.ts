import {
  AdminEventSummaryReadModel,
  EventCollaboratorReadModel,
  EventDetailsReadModel,
  EventListItemReadModel,
  EventPeriodReadModel,
  EventScheduleSummaryReadModel,
  EventTimeSlotReadModel,
} from "@src/domain/read-models/event.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class EventReadMapper {
  static toListItem(doc: unknown): EventListItemReadModel {
    const event = normalizeLeanDocument<EventListItemReadModel>(doc);
    return EventReadMapper.mapListFields(event);
  }

  static toListItems(docs: unknown[]): EventListItemReadModel[] {
    return docs.map((doc) => EventReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): EventDetailsReadModel {
    const event = normalizeLeanDocument<EventDetailsReadModel>(doc);
    return {
      ...EventReadMapper.mapListFields(event),
      rating: event.rating,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      deleted: event.deleted,
      bookedSeats: event.bookedSeats,
      remainingSeats: event.remainingSeats,
    };
  }

  static toScheduleSummary(doc: unknown): EventScheduleSummaryReadModel {
    const event = normalizeLeanDocument<EventScheduleSummaryReadModel>(doc);
    return {
      id: event.id,
      name: event.name,
      schedule: EventReadMapper.mapSchedule(event.schedule) ?? [],
      image: event.image,
      status: event.status,
      deleted: event.deleted,
    };
  }

  static toScheduleSummaries(docs: unknown[]): EventScheduleSummaryReadModel[] {
    return docs.map((doc) => EventReadMapper.toScheduleSummary(doc));
  }

  static toAdminSummary(doc: unknown): AdminEventSummaryReadModel {
    const event = normalizeLeanDocument<AdminEventSummaryReadModel>(doc);
    return {
      id: event.id,
      name: event.name,
      status: event.status,
      lifecycleStatus: event.lifecycleStatus,
      deleted: event.deleted,
      createdAt: event.createdAt,
    };
  }

  static toAdminSummaries(docs: unknown[]): AdminEventSummaryReadModel[] {
    return docs.map((doc) => EventReadMapper.toAdminSummary(doc));
  }

  private static mapListFields(
    event: EventListItemReadModel
  ): EventListItemReadModel {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      image: event.image,
      eventCategory: event.eventCategory,
      place: event.place,
      user: event.user,
      location: event.location,
      online: event.online,
      status: event.status,
      lifecycleStatus: event.lifecycleStatus,
      schedule: EventReadMapper.mapSchedule(event.schedule),
      dateRange: event.dateRange,
      isBookable: event.isBookable,
      capacity: event.capacity,
      maxSeatsPerBooking: event.maxSeatsPerBooking,
    };
  }

  private static mapSchedule(
    schedule: EventDetailsReadModel["schedule"]
  ): EventPeriodReadModel[] | undefined {
    if (!Array.isArray(schedule)) {
      return undefined;
    }

    return schedule.map((period) => ({
      id: period.id,
      startDate: period.startDate,
      endDate: period.endDate,
      timeSlots: Array.isArray(period.timeSlots)
        ? period.timeSlots.map((slot) => EventReadMapper.mapTimeSlot(slot))
        : undefined,
    }));
  }

  private static mapTimeSlot(
    slot: EventTimeSlotReadModel
  ): EventTimeSlotReadModel {
    if (!Array.isArray(slot.collaborators)) {
      return {
        id: slot.id,
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        collaborators: slot.collaborators,
      };
    }

    return {
      id: slot.id,
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      collaborators: slot.collaborators.map((collaborator) =>
        EventReadMapper.mapCollaborator(collaborator)
      ),
    };
  }

  private static mapCollaborator(
    collaborator: EventCollaboratorReadModel | string | Record<string, unknown>
  ): EventCollaboratorReadModel | string {
    if (typeof collaborator === "string") {
      return collaborator;
    }

    if (
      collaborator &&
      typeof collaborator === "object" &&
      "username" in collaborator
    ) {
      const image = collaborator.image as
        | { urls?: { thumbnail?: string | null } }
        | string
        | null
        | undefined;

      const thumbnail =
        image && typeof image === "object"
          ? image.urls?.thumbnail || null
          : null;

      if (typeof collaborator.id !== "string" || collaborator.id.length === 0) {
        throw new Error("Event collaborator read model is missing id");
      }

      return {
        id: collaborator.id,
        name: collaborator.username as string | undefined,
        image: thumbnail,
      };
    }

    if (typeof collaborator.id !== "string" || collaborator.id.length === 0) {
      throw new Error("Event collaborator read model is missing id");
    }
    return {
      id: collaborator.id,
      name: collaborator.name as string | undefined,
      image: collaborator.image as string | null | undefined,
    };
  }
}
