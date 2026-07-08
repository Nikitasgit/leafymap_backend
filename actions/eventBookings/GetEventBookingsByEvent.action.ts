import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventBooking } from "@/types/models/eventBooking";

export interface IGetEventBookingsByEventAction {
  execute(params: { eventId: string }): Promise<IEventBooking[]>;
}

class GetEventBookingsByEventAction implements IGetEventBookingsByEventAction {
  private readonly project: (keyof IEventBooking | string)[] = [
    "_id",
    "seats",
    "status",
    "cancelledAt",
    "createdAt",
    "updatedAt",
    "user",
    "user._id",
    "user.username",
    "user.email",
    "user.image",
    "user.image.urls",
  ];

  constructor(private eventBookingRepository: IEventBookingRepository) {}

  async execute({ eventId }: { eventId: string }): Promise<IEventBooking[]> {
    const eventBookings = await this.eventBookingRepository.findAll({
      filters: { event: eventId, status: "confirmed" },
      project: this.project,
    });

    return eventBookings as IEventBooking[];
  }
}

export default GetEventBookingsByEventAction;
