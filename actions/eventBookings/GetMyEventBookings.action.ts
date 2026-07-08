import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventBooking } from "@/types/models/eventBooking";

export interface IGetMyEventBookingsAction {
  execute(params: { userId: string }): Promise<IEventBooking[]>;
}

class GetMyEventBookingsAction implements IGetMyEventBookingsAction {
  private readonly project: (keyof IEventBooking | string)[] = [
    "_id",
    "seats",
    "status",
    "cancelledAt",
    "createdAt",
    "updatedAt",
    "event",
    "event._id",
    "event.name",
    "event.description",
    "event.status",
    "event.lifecycleStatus",
    "event.dateRange",
    "event.online",
    "event.location",
    "event.isBookable",
    "event.capacity",
    "event.maxSeatsPerBooking",
    "event.deleted",
    "event.image",
    "event.image.urls",
    "event.place",
    "event.place._id",
    "event.place.location",
    "event.place.user",
    "event.place.user.username",
    "event.user",
    "event.user._id",
    "event.user.username",
    "event.user.image",
    "event.user.image.urls",
  ];

  constructor(private eventBookingRepository: IEventBookingRepository) {}

  async execute({ userId }: { userId: string }): Promise<IEventBooking[]> {
    const eventBookings = await this.eventBookingRepository.findAll({
      filters: { user: userId, status: "confirmed" },
      project: this.project,
    });

    return eventBookings as IEventBooking[];
  }
}

export default GetMyEventBookingsAction;
