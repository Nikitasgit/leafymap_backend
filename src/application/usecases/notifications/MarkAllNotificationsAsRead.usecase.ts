import { MarkAllNotificationsAsReadInput } from "@src/application/dtos/notifications/markAllNotificationsAsRead.dto";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class MarkAllNotificationsAsReadUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(
    params: MarkAllNotificationsAsReadInput
  ): Promise<{ markedCount: number }> {
    const markedCount = await this.notificationRepository.markAllAsRead(
      UserId.from(params.userId)
    );
    return { markedCount };
  }
}

export default MarkAllNotificationsAsReadUseCase;
