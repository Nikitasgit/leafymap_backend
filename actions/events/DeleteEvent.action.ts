import { IEventRepository } from "@/types/repositories/event.repository.types";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import logger from "@/utils/logger";
import { ERROR_CODES, NotFoundError } from "@/utils/errors";

export interface IDeleteEventAction {
  execute(params: { eventId: string }): Promise<void>;
}

class DeleteEventAction implements IDeleteEventAction {
  constructor(
    private eventRepository: IEventRepository,
    private cascadeDeleteService: CascadeDeleteService
  ) {}

  async execute({ eventId }: { eventId: string }): Promise<void> {
    const event = await this.eventRepository.findById(eventId, ["_id"]);

    if (!event) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    await this.cascadeDeleteService.deleteEvents([eventId]);

    logger.info(`Event ${eventId} and associated data deleted successfully`);
  }
}

export default DeleteEventAction;
