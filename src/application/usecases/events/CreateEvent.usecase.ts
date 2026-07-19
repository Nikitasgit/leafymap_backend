import { CreateEventInput } from "@src/application/dtos/events/createEvent.dto";
import { Event } from "@src/domain/entities/Event.entity";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import {
  EventCategoryId,
  EventId,
  ImageId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

class CreateEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly placeOwnershipChecker: IPlaceOwnershipChecker
  ) {}

  async execute(input: CreateEventInput): Promise<{ id: EventId }> {
    const ownerId = UserId.from(input.ownerId);

    if (input.placeId) {
      await this.placeOwnershipChecker.assertOwnedBy(
        PlaceId.from(input.placeId),
        ownerId
      );
    }

    const event = Event.create({
      name: input.name,
      description: input.description,
      ownerId,
      categoryId: EventCategoryId.from(input.categoryId),
      schedule: input.schedule,
      placeId:
        input.placeId === undefined
          ? undefined
          : input.placeId
            ? PlaceId.from(input.placeId)
            : null,
      location: input.location,
      online: input.online,
      imageId: input.imageId ? ImageId.from(input.imageId) : undefined,
      status: input.status,
      isBookable: input.isBookable,
      capacity: input.capacity,
      maxSeatsPerBooking: input.maxSeatsPerBooking,
    });

    const id = await this.eventRepository.save(event);
    return { id };
  }
}

export default CreateEventUseCase;
