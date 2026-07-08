import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";
import { ILocation } from "@/types/models/place";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";

export interface CreateEventDTO {
  name: string;
  description: string;
  eventCategory: string;
  schedule: Array<{
    startDate: Date;
    endDate: Date;
    timeSlots?: Array<{
      title: string;
      startTime: string;
      endTime: string;
      collaborators?: Array<{ _id: string }>;
    }>;
  }>;
  user: string;
  place?: string | null;
  location?: ILocation | null;
  online?: boolean;
  image?: string;
  status?: "cancelled" | "full" | "available";
  isBookable?: boolean;
  capacity?: number | null;
  maxSeatsPerBooking?: number;
}

export interface ICreateEventAction {
  execute(params: { eventData: CreateEventDTO }): Promise<{ _id: string }>;
}

class CreateEventAction implements ICreateEventAction {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository
  ) {}

  async execute({
    eventData,
  }: {
    eventData: CreateEventDTO;
  }): Promise<{ _id: string }> {
    if (eventData.place) {
      const place = await this.placeRepository.findById(eventData.place, [
        "user",
      ]);

      if (!place) {
        throw new Error("Place not found");
      }

      if (place.user.toString() !== eventData.user) {
        throw new Error("You don't have permission to use this place");
      }
    }

    const eventId = await this.eventRepository.create({
      ...eventData,
      place: eventData.online ? null : eventData.place || null,
      location: eventData.online ? null : eventData.location || null,
      online: eventData.online || false,
      deleted: false,
    } as Partial<IEvent>);

    return { _id: eventId.toString() };
  }
}

export default CreateEventAction;
