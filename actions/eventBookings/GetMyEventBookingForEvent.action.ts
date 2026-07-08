import { IEventBookingRepository } from "@/types/repositories/eventBooking.repository.types";
import { IEventBooking } from "@/types/models/eventBooking";

export interface IGetMyEventBookingForEventAction {
  execute(params: {
    eventId: string;
    userId: string;
  }): Promise<IEventBooking | null>;
}

class GetMyEventBookingForEventAction
  implements IGetMyEventBookingForEventAction {
  private readonly project: (keyof IEventBooking | string)[] = [
    "_id",
    "event",
    "user",
    "seats",
    "status",
    "createdAt",
    "updatedAt",
  ];

  constructor(private eventBookingRepository: IEventBookingRepository) {}

  async execute({
    eventId,
    userId,
  }: {
    eventId: string;
    userId: string;
  }): Promise<IEventBooking | null> {
    const booking = await this.eventBookingRepository.findOne(
      {
        event: eventId as any,
        user: userId as any,
        status: "confirmed",
      },
      this.project
    );

    return booking;
  }
}

export default GetMyEventBookingForEventAction;
