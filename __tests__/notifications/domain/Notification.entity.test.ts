import { Types } from "mongoose";
import { Notification } from "@src/domain/entities/Notification.entity";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildNotification = (
  overrides: Partial<Parameters<typeof Notification.reconstitute>[0]> = {}
) =>
  Notification.reconstitute({
    id: NotificationId.from(mockObjectId()),
    senderId: UserId.from(mockObjectId()),
    receiverId: UserId.from(mockObjectId()),
    action: NotificationAction.from("new_follower"),
    referenceId: ReferenceId.from(mockObjectId()),
    referenceType: NotificationReferenceType.from("Follow"),
    read: false,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });

describe("Notification entity", () => {
  it("creates an unread notification", () => {
    const senderId = UserId.from(mockObjectId());
    const receiverId = UserId.from(mockObjectId());
    const referenceId = ReferenceId.from(mockObjectId());

    const notification = Notification.create({
      senderId,
      receiverId,
      action: NotificationAction.from("new_follower"),
      referenceId,
      referenceType: NotificationReferenceType.from("Follow"),
    });

    expect(notification.id).toBeNull();
    expect(notification.read).toBe(false);
    expect(notification.readAt).toBeUndefined();
    expect(notification.belongsToReceiver(receiverId)).toBe(true);
    expect(notification.belongsToReceiver(senderId)).toBe(false);
  });

  it("marks as read once", () => {
    const now = new Date("2024-06-01T12:00:00.000Z");
    const notification = buildNotification();
    const read = notification.markAsRead(now);

    expect(read.read).toBe(true);
    expect(read.readAt).toEqual(now);
    expect(notification.read).toBe(false);

    const again = read.markAsRead(new Date("2024-07-01"));
    expect(again).toBe(read);
  });
});
