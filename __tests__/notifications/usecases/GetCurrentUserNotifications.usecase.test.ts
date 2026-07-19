import { Types } from "mongoose";
import GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { IUnreadConversationCounter } from "@src/domain/interfaces/IUnreadConversationCounter";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { createMockNotificationRepository } from "../../helpers/mockNotificationRepository";

describe("GetCurrentUserNotificationsUseCase", () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let unreadConversationCounter: jest.Mocked<IUnreadConversationCounter>;
  let useCase: GetCurrentUserNotificationsUseCase;

  beforeEach(() => {
    notificationRepository = createMockNotificationRepository();
    unreadConversationCounter = { countForUser: jest.fn() };
    useCase = new GetCurrentUserNotificationsUseCase(
      notificationRepository,
      unreadConversationCounter
    );
  });

  it("returns notifications and unread conversation count", async () => {
    const userId = new Types.ObjectId().toString();
    const notifications = [
      {
        _id: "n1",
        action: "new_follower" as const,
        reference: "r1",
        referenceType: "Follow" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    notificationRepository.findRecentForReceiver.mockResolvedValue(
      notifications
    );
    unreadConversationCounter.countForUser.mockResolvedValue(3);

    const result = await useCase.execute({ userId });

    expect(notificationRepository.findRecentForReceiver).toHaveBeenCalledWith(
      UserId.from(userId),
      { limit: 50 }
    );
    expect(unreadConversationCounter.countForUser).toHaveBeenCalledWith(
      UserId.from(userId)
    );
    expect(result).toEqual({ notifications, unreadConversations: 3 });
  });
});
