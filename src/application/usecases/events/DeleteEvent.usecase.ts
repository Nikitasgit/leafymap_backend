import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";
import { EventId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import logger from "@src/shared/logger";
import { DeleteEventInput } from "@src/application/dtos/events/deleteEvent.dto";

class DeleteEventUseCase {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly cascadeDeleter: ICascadeDeleter
  ) {}

  async execute(params: DeleteEventInput): Promise<void> {
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

    await this.cascadeDeleter.deleteEvents([params.eventId]);
    logger.info(
      `Event ${params.eventId} and associated data deleted successfully`
    );
  }
}

export default DeleteEventUseCase;
