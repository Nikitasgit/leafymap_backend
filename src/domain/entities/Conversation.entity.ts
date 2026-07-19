import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface CreateConversationParams {
  participantIds: [UserId, UserId];
}

export interface ReconstituteConversationParams {
  id: ConversationId;
  participantIds: UserId[];
  lastMessageId?: MessageId;
  createdAt: Date;
  updatedAt: Date;
}

export class Conversation {
  private constructor(
    public readonly id: ConversationId | null,
    public readonly participantIds: UserId[],
    public readonly lastMessageId: MessageId | undefined,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateConversationParams): Conversation {
    const now = new Date();
    return new Conversation(
      null,
      [...params.participantIds],
      undefined,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteConversationParams): Conversation {
    return new Conversation(
      params.id,
      [...params.participantIds],
      params.lastMessageId,
      params.createdAt,
      params.updatedAt
    );
  }

  isParticipant(userId: UserId): boolean {
    return this.participantIds.includes(userId);
  }

  withLastMessage(messageId: MessageId): Conversation {
    return new Conversation(
      this.id,
      this.participantIds,
      messageId,
      this.createdAt,
      new Date()
    );
  }
}
