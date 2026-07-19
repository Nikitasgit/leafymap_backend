import { UpdateEventInput } from "@src/application/dtos/events/updateEvent.dto";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import {
  EventCategoryId,
  EventId,
  ImageId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class UpdateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly placeOwnershipChecker: IPlaceOwnershipChecker
  ) {}

  async execute(input: UpdateEventInput): Promise<void> {
    const eventId = EventId.from(input.eventId);
    const actorId = UserId.from(input.actorId);

    const event = await this.eventRepository.findById(eventId);
    if (!event || event.deleted) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    if (!event.belongsTo(actorId)) {
      throw new ForbiddenError(
        ERROR_CODES.FORBIDDEN,
        "You don't have permission to update this event"
      );
    }

    if (input.placeId) {
      await this.placeOwnershipChecker.assertOwnedBy(
        PlaceId.from(input.placeId),
        actorId
      );
    }

    const updated = event.update({
      name: input.name,
      description: input.description,
      categoryId: input.categoryId
        ? EventCategoryId.from(input.categoryId)
        : undefined,
      schedule: input.schedule,
      placeId:
        input.placeId !== undefined
          ? input.placeId
            ? PlaceId.from(input.placeId)
            : null
          : undefined,
      location: input.location,
      online: input.online,
      imageId: input.imageId ? ImageId.from(input.imageId) : undefined,
      status: input.status,
      isBookable: input.isBookable,
      capacity: input.capacity,
      maxSeatsPerBooking: input.maxSeatsPerBooking,
    });

    await this.eventRepository.update(updated);
  }
}

export default UpdateEventUseCase;
