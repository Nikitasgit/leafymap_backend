import { Types } from "mongoose";
import CreateNotificationUseCase from "@src/application/usecases/notifications/CreateNotification.usecase";
import { User } from "@src/domain/entities/User.entity";
import { INotificationEmailSender } from "@src/domain/interfaces/INotificationEmailSender";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { NotificationId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { createMockNotificationRepository } from "../../helpers/mockNotificationRepository";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (
  overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}
) =>
  User.reconstitute({
    id: UserId.from(mockObjectId()),
    email: "user@example.com",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });

describe("CreateNotificationUseCase", () => {
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let notificationEmailSender: jest.Mocked<INotificationEmailSender>;
  let useCase: CreateNotificationUseCase;

  const senderId = mockObjectId();
  const receiverId = mockObjectId();
  const referenceId = mockObjectId();
  const notificationId = NotificationId.from(mockObjectId());

  beforeEach(() => {
    jest.clearAllMocks();
    notificationRepository = createMockNotificationRepository();
    userRepository = createMockUserRepository();
    notificationEmailSender = {
      sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new CreateNotificationUseCase(
      notificationRepository,
      userRepository,
      notificationEmailSender
    );
    notificationRepository.save.mockResolvedValue(notificationId);
  });

  it("saves a notification and returns its id", async () => {
    userRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      senderId,
      receiverId,
      action: "new_follower",
      referenceId,
      referenceType: "Follow",
    });

    expect(result).toBe(notificationId);
    expect(notificationRepository.save).toHaveBeenCalledTimes(1);
  });

  it("skips email when receiver has email notifications disabled", async () => {
    userRepository.findById
      .mockResolvedValueOnce(
        buildUser({
          id: UserId.from(receiverId),
          preferences: UserPreferences.from({ emailNotifications: false }),
        })
      )
      .mockResolvedValueOnce(
        buildUser({ id: UserId.from(senderId), username: "alice" })
      );

    await useCase.execute({
      senderId,
      receiverId,
      action: "new_follower",
      referenceId,
      referenceType: "Follow",
    });

    expect(notificationEmailSender.sendNotificationEmail).not.toHaveBeenCalled();
  });

  it("sends email when receiver opted in", async () => {
    userRepository.findById
      .mockResolvedValueOnce(
        buildUser({
          id: UserId.from(receiverId),
          email: "receiver@example.com",
          preferences: UserPreferences.from({ emailNotifications: true }),
        })
      )
      .mockResolvedValueOnce(
        buildUser({ id: UserId.from(senderId), username: "alice" })
      );

    await useCase.execute({
      senderId,
      receiverId,
      action: "new_follower",
      referenceId,
      referenceType: "Follow",
    });

    expect(notificationEmailSender.sendNotificationEmail).toHaveBeenCalledWith({
      email: "receiver@example.com",
      action: "new_follower",
      senderName: "alice",
    });
  });

  it("throttles message emails when a similar notification exists", async () => {
    notificationRepository.existsRecentSimilar.mockResolvedValue(true);

    await useCase.execute({
      senderId,
      receiverId,
      action: "message",
      referenceId,
      referenceType: "Message",
    });

    expect(notificationRepository.existsRecentSimilar).toHaveBeenCalled();
    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(notificationEmailSender.sendNotificationEmail).not.toHaveBeenCalled();
  });
});
