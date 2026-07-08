import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEvent } from "@/types/models/event";

export interface IGetEventByIdAction {
  execute(params: { eventId: string }): Promise<IEvent>;
}

class GetEventByIdAction implements IGetEventByIdAction {
  private readonly defaultProject: (keyof IEvent | string)[] = [
    "_id",
    "name",
    "description",
    "status",
    "lifecycleStatus",
    "schedule",
    "dateRange",
    "eventCategory",
    "eventCategory.name",
    "place",
    "user",
    "location",
    "online",
    "image",
    "rating",
    "isBookable",
    "capacity",
    "maxSeatsPerBooking",
    "createdAt",
    "updatedAt",
    "place._id",
    "place.location",
    "place.user",
    "place.user.username",
    "user._id",
    "user.username",
    "user.image",
    "user.image.urls",
    "image._id",
    "image.urls",
    "deleted",
    "schedule.timeSlots.collaborators",
    "schedule.timeSlots.collaborators._id",
    "schedule.timeSlots.collaborators.username",
    "schedule.timeSlots.collaborators.image",
    "schedule.timeSlots.collaborators.image.urls",
  ];

  constructor(
    private eventRepository: IEventRepository,
    private eventBookingRepository: IEventBookingRepository
  ) {}

  async execute({ eventId }: { eventId: string }): Promise<IEvent> {
    const event = await this.eventRepository.findById(
      eventId,
      this.defaultProject
    );

    if (!event || event.deleted) {
      throw new Error("Event not found");
    }

    let bookedSeats: number | undefined;
    let remainingSeats: number | null | undefined;

    if (event.isBookable) {
      bookedSeats = await this.eventBookingRepository.sumConfirmedSeats(
        eventId
      );
      remainingSeats =
        typeof event.capacity === "number"
          ? Math.max(event.capacity - bookedSeats, 0)
          : null;
    }

    const updatedEvent = {
      ...event,
      bookedSeats,
      remainingSeats,
      schedule: event.schedule.map((period) => ({
        ...period,
        timeSlots: period.timeSlots?.map((slot) => ({
          ...slot,
          collaborators: slot.collaborators.map((collaborator: any) => {
            if (typeof collaborator === "object" && collaborator !== null) {
              return {
                name: collaborator.username,
                image: collaborator.image?.urls?.thumbnail || null,
                _id: collaborator._id,
              };
            }
            return collaborator;
          }),
        })),
      })),
    };

    return updatedEvent as IEvent;
  }
}

export default GetEventByIdAction;
