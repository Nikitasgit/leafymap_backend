import cron from "node-cron";
import { IEventRepository } from "../../repositories/events/IEventRepository";
import UpdateEventLifecycleStatusAction from "../../actions/events/UpdateEventLifecycleStatusAction";
import logger from "../../utils/logger";

class EventsCronService {
  private updateEventLifecycleStatusAction: UpdateEventLifecycleStatusAction;

  constructor(eventRepository: IEventRepository) {
    this.updateEventLifecycleStatusAction =
      new UpdateEventLifecycleStatusAction(eventRepository);
  }

  start(): void {
    cron.schedule("*/2 * * * *", async () => {
      try {
        logger.info("Starting scheduled event lifecycle status update...");
        await this.updateEventLifecycleStatusAction.execute();
      } catch (error) {
        logger.error(
          "Error in scheduled event lifecycle status update:",
          error
        );
      }
    });

    logger.info(
      "Cron jobs started: Event lifecycle status update (every 2 minutes)"
    );
  }
}

export default EventsCronService;
