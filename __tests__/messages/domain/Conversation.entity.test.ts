import { Types } from "mongoose";
import { Conversation } from "@src/domain/entities/Conversation.entity";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("Conversation entity", () => {
  it("creates a conversation with two participants", () => {
    const a = UserId.from(mockObjectId());
    const b = UserId.from(mockObjectId());

    const conversation = Conversation.create({
      participantIds: [a, b],
    });

    expect(conversation.id).toBeNull();
    expect(conversation.participantIds).toEqual([a, b]);
    expect(conversation.lastMessageId).toBeUndefined();
  });

  it("isParticipant checks membership", () => {
    const a = UserId.from(mockObjectId());
    const b = UserId.from(mockObjectId());
    const outsider = UserId.from(mockObjectId());
    const conversation = Conversation.create({
      participantIds: [a, b],
    });

    expect(conversation.isParticipant(a)).toBe(true);
    expect(conversation.isParticipant(outsider)).toBe(false);
  });

  it("withLastMessage updates lastMessageId", () => {
    const conversation = Conversation.reconstitute({
      id: ConversationId.from(mockObjectId()),
      participantIds: [
        UserId.from(mockObjectId()),
        UserId.from(mockObjectId()),
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const messageId = MessageId.from(mockObjectId());
    const updated = conversation.withLastMessage(messageId);

    expect(updated.lastMessageId).toBe(messageId);
    expect(updated).not.toBe(conversation);
  });
});
