import { Types } from "mongoose";
import MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockNotificationRepository } from "../../helpers/mockNotificationRepository";

describe("MarkNotificationsAsReadUseCase", () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let useCase: MarkNotificationsAsReadUseCase;

  beforeEach(() => {
    notificationRepository = createMockNotificationRepository();
    useCase = new MarkNotificationsAsReadUseCase(notificationRepository);
  });

  it("marks unread notifications for an action", async () => {
    const userId = new Types.ObjectId().toString();
    notificationRepository.markAsReadByAction.mockResolvedValue(2);

    await expect(
      useCase.execute({ userId, action: "new_follower" })
    ).resolves.toEqual({ markedCount: 2 });

    expect(notificationRepository.markAsReadByAction).toHaveBeenCalledWith(
      UserId.from(userId),
      NotificationAction.from("new_follower")
    );
  });

  it("rejects invalid actions", async () => {
    await expect(
      useCase.execute({
        userId: new Types.ObjectId().toString(),
        action: "not_a_real_action",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.VALIDATION_ERROR,
    });
    expect(notificationRepository.markAsReadByAction).not.toHaveBeenCalled();
  });
});
