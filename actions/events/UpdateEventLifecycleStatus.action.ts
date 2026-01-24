import { IEventRepository } from "@/types/repositories/event.repository.types";
import EventStatusService from "@/services/eventStatusService";
import logger from "@/utils/logger";

export interface IUpdateEventLifecycleStatusAction {
  execute(): Promise<void>;
}

class UpdateEventLifecycleStatusAction
  implements IUpdateEventLifecycleStatusAction
{
  private eventStatusService: EventStatusService;

  constructor(private eventRepository: IEventRepository) {
    this.eventStatusService = new EventStatusService();
  }

  async execute(): Promise<void> {
    try {
      const events = await this.eventRepository.findAll({
        filters: { deleted: false },
        project: ["_id", "schedule", "dateRange", "lifecycleStatus"],
        limit: 10000,
      });

      let updatedCount = 0;

      for (const event of events) {
        if (!event.schedule || event.schedule.length === 0) {
          continue;
        }

        let dateRange = event.dateRange;
        if (!dateRange || !dateRange.firstDate) {
          dateRange = this.eventStatusService.getEventDateRange(event.schedule);
          await this.eventRepository.updateOne(event._id.toString(), {
            dateRange,
          });
        }

        const lifecycleStatus =
          this.eventStatusService.getLifecycleStatus(dateRange);
        if (event.lifecycleStatus !== lifecycleStatus) {
          await this.eventRepository.updateOne(event._id.toString(), {
            lifecycleStatus,
          });
          updatedCount++;
        }
      }

      logger.info(
        `Event lifecycle status update completed. Updated ${updatedCount} events.`
      );
    } catch (error) {
      logger.error("Error updating event lifecycle statuses:", error);
      throw error;
    }
  }
}

export default UpdateEventLifecycleStatusAction;
