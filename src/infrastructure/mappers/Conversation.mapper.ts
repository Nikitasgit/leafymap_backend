import { Conversation } from "@src/domain/entities/Conversation.entity";
import {
  ConversationId,
  MessageId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ConversationDocumentProps } from "@src/infrastructure/persistence/schemas/Conversation.schema";
import { Types } from "mongoose";

export class ConversationMapper {
  static toDomain(
    doc: ConversationDocumentProps & { _id: Types.ObjectId }
  ): Conversation {
    return Conversation.reconstitute({
      id: ConversationId.from(doc._id.toString()),
      participantIds: (doc.participants ?? []).map((id) =>
        UserId.from(id.toString())
      ),
      lastMessageId: doc.lastMessage
        ? MessageId.from(doc.lastMessage.toString())
        : undefined,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    conversation: Conversation
  ): Omit<ConversationDocumentProps, "_id"> {
    return {
      participants: conversation.participantIds.map(
        (id) => new Types.ObjectId(id)
      ),
      lastMessage: conversation.lastMessageId
        ? new Types.ObjectId(conversation.lastMessageId)
        : undefined,
    };
  }
}
