import cron from "node-cron";
import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { IUpdateEventLifecycleStatusUseCase } from "@src/application/usecases/events/UpdateEventLifecycleStatus.usecase";
import logger from "@/utils/logger";

class EventsCronService {
  constructor(
    private updateEventLifecycleStatusUseCase: IUpdateEventLifecycleStatusUseCase,
    private eventInvitationRepo: IEventInvitationRepository
  ) {}

  start(): void {
    cron.schedule("*/10 * * * *", async () => {
      try {
        logger.info("Starting scheduled event lifecycle status update...");
        const transitionedEventIds =
          await this.updateEventLifecycleStatusUseCase.execute();

        if (transitionedEventIds.length > 0) {
          const cancelledCount = await this.eventInvitationRepo.updateMany(
            {
              eventIn: transitionedEventIds,
              status: "pending",
            },
            { status: "cancelled", deleted: true }
          );
          if (cancelledCount > 0) {
            logger.info(
              `Cancelled ${cancelledCount} pending event invitations for ended events.`
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
      "Cron jobs started: Event lifecycle status update (every 10 minutes)"
    );
  }
}

export default EventsCronService;
