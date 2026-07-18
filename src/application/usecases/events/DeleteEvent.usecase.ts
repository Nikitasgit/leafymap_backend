import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import CascadeDeleteService from "@/services/cascadeDeleteService";
import logger from "@/utils/logger";

export interface IDeleteEventUseCase {
  execute(params: { eventId: string; actorId: string }): Promise<void>;
}

class DeleteEventUseCase implements IDeleteEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cascadeDeleteService: CascadeDeleteService
  ) {}

  async execute(params: {
    eventId: string;
    actorId: string;
  }): Promise<void> {
    const eventId = EventId.from(params.eventId);
    const actorId = UserId.from(params.actorId);

    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(ERROR_CODES.EVENT_NOT_FOUND, "Event not found");
    }

    if (!event.belongsTo(actorId)) {
      throw new ForbiddenError(
        ERROR_CODES.FORBIDDEN,
        "You don't have permission to delete this event"
      );
    }

    await this.cascadeDeleteService.deleteEvents([params.eventId]);
    logger.info(
      `Event ${params.eventId} and associated data deleted successfully`
    );
  }
}

export default DeleteEventUseCase;
