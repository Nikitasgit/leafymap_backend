import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEvent } from "@/types/models/event";

export interface UpdateEventDTO {
  name?: string;
  description?: string;
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
  image?: string;
  status?: "cancelled" | "full" | "available";
}

export interface IUpdateEventAction {
  execute(params: {
    eventId: string;
    updateData: UpdateEventDTO;
  }): Promise<void>;
}

class UpdateEventAction implements IUpdateEventAction {
  constructor(private eventRepository: IEventRepository) {}

  async execute({
    eventId,
    updateData,
  }: {
    eventId: string;
    updateData: UpdateEventDTO;
  }): Promise<void> {
    const event = await this.eventRepository.findById(eventId, ["_id"]);

    if (!event) {
      throw new Error("Event not found");
    }

    await this.eventRepository.updateOne(
      eventId,
      updateData as Partial<IEvent>
    );
  }
}

export default UpdateEventAction;
