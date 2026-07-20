import {
  EventCollaboratorReadModel,
  EventDetailsReadModel,
  EventListItemReadModel,
  EventPeriodReadModel,
  EventTimeSlotReadModel,
} from "@src/domain/read-models/event.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape nested structures into the typed read model expected by the API.
 */
export class EventReadMapper {
  static toListItem(doc: unknown): EventListItemReadModel {
    return normalizeLeanDocument<EventListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): EventListItemReadModel[] {
    return docs.map((doc) => EventReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): EventDetailsReadModel {
    const normalized = normalizeLeanDocument<EventDetailsReadModel>(doc);
    return {
      ...normalized,
      schedule: EventReadMapper.mapSchedule(normalized.schedule),
    };
  }

  private static mapSchedule(
    schedule: EventDetailsReadModel["schedule"]
  ): EventPeriodReadModel[] | undefined {
    if (!Array.isArray(schedule)) {
      return schedule;
    }

    return schedule.map((period) => ({
      ...period,
      timeSlots: Array.isArray(period.timeSlots)
        ? period.timeSlots.map((slot) => EventReadMapper.mapTimeSlot(slot))
        : period.timeSlots,
    }));
  }

  private static mapTimeSlot(
    slot: EventTimeSlotReadModel
  ): EventTimeSlotReadModel {
    if (!Array.isArray(slot.collaborators)) {
      return slot;
    }

    return {
      ...slot,
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

      return {
        id: String(collaborator.id ?? ""),
        name: collaborator.username as string | undefined,
        image: thumbnail,
      };
    }

    return collaborator as EventCollaboratorReadModel;
  }
}
