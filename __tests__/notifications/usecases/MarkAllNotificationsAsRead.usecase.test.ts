import { Types } from "mongoose";
import MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { createMockNotificationRepository } from "../../helpers/mockNotificationRepository";

describe("MarkAllNotificationsAsReadUseCase", () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let useCase: MarkAllNotificationsAsReadUseCase;

  beforeEach(() => {
    notificationRepository = createMockNotificationRepository();
    useCase = new MarkAllNotificationsAsReadUseCase(notificationRepository);
  });

  it("marks all unread notifications for the user", async () => {
    const userId = new Types.ObjectId().toString();
    notificationRepository.markAllAsRead.mockResolvedValue(5);

    await expect(useCase.execute({ userId })).resolves.toEqual({
      markedCount: 5,
    });

    expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(
      UserId.from(userId)
    );
  });
});
