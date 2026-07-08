import cron from "node-cron";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IEventInvitationRepository } from "@/types/repositories/eventInvitation.repository.types";
import { UpdateEventLifecycleStatusAction } from "@/actions/events";
import logger from "@/utils/logger";

class EventsCronService {
  private updateEventLifecycleStatusAction: UpdateEventLifecycleStatusAction;
  private eventInvitationRepo: IEventInvitationRepository;

  constructor(
    eventRepository: IEventRepository,
    eventInvitationRepo: IEventInvitationRepository
  ) {
    this.updateEventLifecycleStatusAction =
      new UpdateEventLifecycleStatusAction(eventRepository);
    this.eventInvitationRepo = eventInvitationRepo;
  }

  start(): void {
    cron.schedule("*/10 * * * *", async () => {
      try {
        logger.info("Starting scheduled event lifecycle status update...");
        const transitionedEventIds =
          await this.updateEventLifecycleStatusAction.execute();

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
      "Cron jobs started: Event lifecycle status update (every 2 minutes)"
    );
  }
}

export default EventsCronService;
