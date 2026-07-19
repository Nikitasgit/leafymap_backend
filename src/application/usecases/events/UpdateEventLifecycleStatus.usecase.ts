import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  getEventDateRange,
  getLifecycleStatus,
} from "@src/domain/value-objects/EventSchedule.vo";
import logger from "@src/shared/logger";

class UpdateEventLifecycleStatusUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(): Promise<string[]> {
    try {
      const events = await this.eventRepository.findAllForLifecycleUpdate(
        10000
      );

      let updatedCount = 0;
      const transitionedToCompletedOrUnvalidIds: string[] = [];

      for (const event of events) {
        if (!event.schedule || event.schedule.length === 0) {
          continue;
        }

        let dateRange = event.dateRange;
        if (!dateRange || !dateRange.firstDate) {
          dateRange = getEventDateRange(event.schedule);
          await this.eventRepository.updateLifecycleFields(event.id, {
            dateRange,
          });
        }

        const lifecycleStatus = getLifecycleStatus(dateRange);
        if (event.lifecycleStatus !== lifecycleStatus) {
          await this.eventRepository.updateLifecycleFields(event.id, {
            lifecycleStatus,
          });
          updatedCount++;
          if (
            lifecycleStatus === "completed" ||
            lifecycleStatus === "unvalid"
          ) {
            transitionedToCompletedOrUnvalidIds.push(event.id.toString());
          }
        }
      }

      logger.info(
        `Event lifecycle status update completed. Updated ${updatedCount} events.`
      );

      return transitionedToCompletedOrUnvalidIds;
    } catch (error) {
      logger.error("Error updating event lifecycle statuses:", error);
      throw error;
    }
  }
}

export default UpdateEventLifecycleStatusUseCase;
