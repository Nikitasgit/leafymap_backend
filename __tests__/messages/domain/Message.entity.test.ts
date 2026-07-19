import { Types } from "mongoose";
import { Message } from "@src/domain/entities/Message.entity";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("Message entity", () => {
  it("creates a message with empty readBy", () => {
    const conversationId = ConversationId.from(mockObjectId());
    const senderId = UserId.from(mockObjectId());

    const message = Message.create({
      conversationId,
      senderId,
      content: "hello",
    });

    expect(message.id).toBeNull();
    expect(message.conversationId).toBe(conversationId);
    expect(message.senderId).toBe(senderId);
    expect(message.content).toBe("hello");
    expect(message.readBy).toEqual([]);
    expect(message.deleted).toBe(false);
  });

  it("belongsTo checks sender ownership", () => {
    const senderId = UserId.from(mockObjectId());
    const otherId = UserId.from(mockObjectId());
    const message = Message.create({
      conversationId: ConversationId.from(mockObjectId()),
      senderId,
      content: "hi",
    });

    expect(message.belongsTo(senderId)).toBe(true);
    expect(message.belongsTo(otherId)).toBe(false);
  });

  it("withContent returns a new instance", () => {
    const message = Message.reconstitute({
      id: MessageId.from(mockObjectId()),
      conversationId: ConversationId.from(mockObjectId()),
      senderId: UserId.from(mockObjectId()),
      content: "old",
      readBy: [],
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const updated = message.withContent("new");
    expect(updated.content).toBe("new");
    expect(updated).not.toBe(message);
    expect(message.content).toBe("old");
  });

  it("markReadBy is idempotent", () => {
    const userId = UserId.from(mockObjectId());
    const message = Message.reconstitute({
      id: MessageId.from(mockObjectId()),
      conversationId: ConversationId.from(mockObjectId()),
      senderId: UserId.from(mockObjectId()),
      content: "hi",
      readBy: [],
      deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const once = message.markReadBy(userId);
    const twice = once.markReadBy(userId);
    expect(once.readBy).toEqual([userId]);
    expect(twice).toBe(once);
  });
});
