import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";
import { ILocation } from "@/types/models/place";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@/utils/errors";

export interface UpdateEventDTO {
  name?: string;
  description?: string;
  eventCategory?: string;
  schedule?: Array<{
    startDate: Date;
    endDate: Date;
    timeSlots?: Array<{
      title: string;
      startTime: string;
      endTime: string;
      collaborators?: Array<{ _id: string }>;
    }>;
  }>;
  place?: string | null;
  location?: ILocation | null;
  online?: boolean;
  image?: string;
  status?: "cancelled" | "full" | "available";
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}

export interface IUpdateEventAction {
  execute(params: {
    eventId: string;
    userId: string;
    updateData: UpdateEventDTO;
  }): Promise<void>;
}

class UpdateEventAction implements IUpdateEventAction {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository
  ) {}

  async execute({
    eventId,
    userId,
    updateData,
  }: {
    eventId: string;
    userId: string;
    updateData: UpdateEventDTO;
  }): Promise<void> {
    const event = await this.eventRepository.findById(eventId, ["_id"]);

    if (!event) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    if (updateData.place) {
      const place = await this.placeRepository.findById(updateData.place, [
        "user",
      ]);

      if (!place) {
        throw new NotFoundError(ERROR_CODES.PLACE_NOT_FOUND, "Place not found");
      }

      if (place.user.toString() !== userId) {
        throw new ForbiddenError(
          ERROR_CODES.EVENT_PLACE_FORBIDDEN,
          "You don't have permission to use this place"
        );
      }
    }

    const normalizedUpdate = {
      ...updateData,
      place: updateData.online ? null : updateData.place,
      location: updateData.online ? null : updateData.location,
    };

    await this.eventRepository.updateOne(
      eventId,
      normalizedUpdate as Partial<IEvent>
    );
  }
}

export default UpdateEventAction;
