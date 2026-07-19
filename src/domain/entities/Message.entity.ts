import {
  ConversationId,
  MessageId,
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface CreateMessageParams {
  conversationId: ConversationId;
  senderId: UserId;
  content: string;
}

export interface ReconstituteMessageParams {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  content?: string;
  readBy: UserId[];
  partnershipId?: PartnershipId;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Message {
  private constructor(
    public readonly id: MessageId | null,
    public readonly conversationId: ConversationId,
    public readonly senderId: UserId,
    public readonly content: string | undefined,
    public readonly readBy: UserId[],
    public readonly partnershipId: PartnershipId | undefined,
    public readonly deleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateMessageParams): Message {
    const now = new Date();
    return new Message(
      null,
      params.conversationId,
      params.senderId,
      params.content,
      [],
      undefined,
      false,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteMessageParams): Message {
    return new Message(
      params.id,
      params.conversationId,
      params.senderId,
      params.content,
      [...params.readBy],
      params.partnershipId,
      params.deleted,
      params.createdAt,
      params.updatedAt
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.senderId === userId;
  }

  withContent(content: string): Message {
    return new Message(
      this.id,
      this.conversationId,
      this.senderId,
      content,
      this.readBy,
      this.partnershipId,
      this.deleted,
      this.createdAt,
      new Date()
    );
  }

  markReadBy(userId: UserId): Message {
    if (this.readBy.includes(userId)) {
      return this;
    }
    return new Message(
      this.id,
      this.conversationId,
      this.senderId,
      this.content,
      [...this.readBy, userId],
      this.partnershipId,
      this.deleted,
      this.createdAt,
      new Date()
    );
  }
}
