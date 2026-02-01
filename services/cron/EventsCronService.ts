import cron from "node-cron";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
import { UpdateEventLifecycleStatusAction } from "@/actions/events";
import logger from "@/utils/logger";

class EventsCronService {
  private updateEventLifecycleStatusAction: UpdateEventLifecycleStatusAction;
  private partnershipRepository: IPartnershipRepository;

  constructor(
    eventRepository: IEventRepository,
    partnershipRepository: IPartnershipRepository
  ) {
    this.updateEventLifecycleStatusAction =
      new UpdateEventLifecycleStatusAction(eventRepository);
    this.partnershipRepository = partnershipRepository;
  }

  start(): void {
    cron.schedule("*/2 * * * *", async () => {
      try {
        logger.info("Starting scheduled event lifecycle status update...");
        const transitionedEventIds =
          await this.updateEventLifecycleStatusAction.execute();

        if (transitionedEventIds.length > 0) {
          const cancelledCount = await this.partnershipRepository.updateMany(
            {
              eventIn: transitionedEventIds,
              status: "pending",
            },
            { status: "cancelled", deleted: true }
          );
          if (cancelledCount > 0) {
            logger.info(
              `Cancelled ${cancelledCount} pending partnerships for ended events.`
            );
          }
        }
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
