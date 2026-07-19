import { MarkNotificationsAsReadInput } from "@src/application/dtos/notifications/markNotificationsAsRead.dto";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class MarkNotificationsAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    params: MarkNotificationsAsReadInput
  ): Promise<{ markedCount: number }> {
    const markedCount = await this.notificationRepository.markAsReadByAction(
      UserId.from(params.userId),
      NotificationAction.from(params.action)
    );
    return { markedCount };
  }
}

export default MarkNotificationsAsReadUseCase;
