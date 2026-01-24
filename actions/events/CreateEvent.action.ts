import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";
import { Types } from "mongoose";

export interface CreateEventDTO {
  name: string;
  description: string;
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
  place: string;
  image?: string;
  status?: "cancelled" | "full" | "available";
}

export interface ICreateEventAction {
  execute(params: { eventData: CreateEventDTO }): Promise<{ _id: string }>;
}

class CreateEventAction implements ICreateEventAction {
  constructor(private eventRepository: IEventRepository) {}

  async execute({
    eventData,
  }: {
    eventData: CreateEventDTO;
  }): Promise<{ _id: string }> {
    const eventId = await this.eventRepository.create({
      ...eventData,
      deleted: false,
    } as Partial<IEvent>);

    return { _id: eventId.toString() };
  }
}

export default CreateEventAction;
