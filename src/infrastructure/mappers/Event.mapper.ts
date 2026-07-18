import { Event, EventLocation } from "@src/domain/entities/Event.entity";
import {
  EventCategoryId,
  EventId,
  ImageId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { EventStatus } from "@src/domain/value-objects/EventStatus.vo";
import { LifecycleStatus } from "@src/domain/value-objects/LifecycleStatus.vo";
import {
  EventPeriod,
  EventTimeSlot,
} from "@src/domain/value-objects/EventSchedule.vo";
import {
  EventDocumentProps,
  EventPeriodDocument,
} from "@src/infrastructure/persistence/schemas/Event.schema";
import { Types } from "mongoose";

function toDomainSchedule(schedule: EventPeriodDocument[]): EventPeriod[] {
  return schedule.map((period) => ({
    startDate: new Date(period.startDate),
    endDate: new Date(period.endDate),
    timeSlots: period.timeSlots?.map(
      (slot): EventTimeSlot => ({
        id: slot._id?.toString(),
        title: slot.title,
        startTime: slot.startTime,
        endTime: slot.endTime,
        collaboratorIds: (slot.collaborators ?? []).map((id) =>
          id.toString()
        ),
      })
    ),
  }));
}

function toPersistenceSchedule(
  schedule: EventPeriod[]
): EventPeriodDocument[] {
  return schedule.map((period) => ({
    startDate: period.startDate,
    endDate: period.endDate,
    timeSlots: period.timeSlots?.map((slot) => ({
      ...(slot.id ? { _id: new Types.ObjectId(slot.id) } : {}),
      title: slot.title,
      startTime: slot.startTime,
      endTime: slot.endTime,
      collaborators: (slot.collaboratorIds ?? []).map(
        (id) => new Types.ObjectId(id)
      ),
    })),
  }));
}

export class EventMapper {
  static toDomain(
    doc: EventDocumentProps & { _id: Types.ObjectId }
  ): Event {
    return Event.reconstitute({
      id: EventId.from(doc._id.toString()),
      name: doc.name,
      description: doc.description,
      ownerId: UserId.from(doc.user.toString()),
      categoryId: EventCategoryId.from(doc.eventCategory.toString()),
      schedule: toDomainSchedule(doc.schedule ?? []),
      dateRange: {
        firstDate: doc.dateRange?.firstDate
          ? new Date(doc.dateRange.firstDate)
          : new Date(0),
        latestDate: doc.dateRange?.latestDate
          ? new Date(doc.dateRange.latestDate)
          : new Date(0),
      },
      status: EventStatus.from(doc.status),
      lifecycleStatus: LifecycleStatus.from(doc.lifecycleStatus),
      placeId: doc.place ? PlaceId.from(doc.place.toString()) : doc.place,
      location: (doc.location as EventLocation | null | undefined) ?? null,
      online: doc.online ?? false,
      imageId: doc.image ? ImageId.from(doc.image.toString()) : undefined,
      rating: doc.rating ?? 0,
      isBookable: doc.isBookable ?? false,
      capacity: doc.capacity,
      maxSeatsPerBooking: doc.maxSeatsPerBooking ?? 1,
      deleted: doc.deleted ?? false,
      deletedAt: doc.deletedAt,
      deletedBy: doc.deletedBy
        ? UserId.from(doc.deletedBy.toString())
        : undefined,
      deleteReason: doc.deleteReason,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    event: Event
  ): Omit<EventDocumentProps, "_id"> {
    return {
      name: event.name,
      description: event.description,
      schedule: toPersistenceSchedule(event.schedule),
      eventCategory: new Types.ObjectId(event.categoryId),
      user: new Types.ObjectId(event.ownerId),
      place: event.placeId ? new Types.ObjectId(event.placeId) : null,
      location: event.location ?? null,
      online: event.online,
      image: event.imageId
        ? new Types.ObjectId(event.imageId)
        : undefined,
      status: event.status,
      lifecycleStatus: event.lifecycleStatus,
      dateRange: event.dateRange,
      rating: event.rating,
      isBookable: event.isBookable,
      capacity: event.capacity ?? null,
      maxSeatsPerBooking: event.maxSeatsPerBooking,
      deleted: event.deleted,
      deletedAt: event.deletedAt,
      deletedBy: event.deletedBy
        ? new Types.ObjectId(event.deletedBy)
        : undefined,
      deleteReason: event.deleteReason,
    };
  }

  static scheduleToPersistence(schedule: EventPeriod[]): EventPeriodDocument[] {
    return toPersistenceSchedule(schedule);
  }

  static scheduleToDomain(schedule: EventPeriodDocument[]): EventPeriod[] {
    return toDomainSchedule(schedule);
  }
}
