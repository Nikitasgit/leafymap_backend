import { IUser } from "types/models";
import { IEventRepository } from "../../repositories/events/IEventRepository";
import { IEvent } from "../../types/models/event";

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
    "place",
    "image",
    "rating",
    "createdAt",
    "updatedAt",
    "place._id",
    "place.location",
    "place.user",
    "image._id",
    "image.urls",
    "schedule.timeSlots.collaborators",
    "schedule.timeSlots.collaborators._id",
    "schedule.timeSlots.collaborators.username",
    "schedule.timeSlots.collaborators.image",
    "schedule.timeSlots.collaborators.image.urls",
  ];

  constructor(private eventRepository: IEventRepository) {}

  async execute({ eventId }: { eventId: string }): Promise<IEvent> {
    const event = await this.eventRepository.findById(
      eventId,
      this.defaultProject
    );

    if (!event) {
      throw new Error("Event not found");
    }

    const updatedEvent = {
      ...event,
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
