import { Message } from "@src/domain/entities/Message.entity";
import {
  ConversationId,
  MessageId,
  PartnershipId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { MessageDocumentProps } from "@src/infrastructure/persistence/schemas/Message.schema";
import { Types } from "mongoose";

export class MessageMapper {
  static toDomain(
    doc: MessageDocumentProps & { _id: Types.ObjectId }
  ): Message {
    return Message.reconstitute({
      id: MessageId.from(doc._id.toString()),
      conversationId: ConversationId.from(doc.conversation.toString()),
      senderId: UserId.from(doc.sender.toString()),
      content: doc.content,
      readBy: (doc.readBy ?? []).map((id) => UserId.from(id.toString())),
      partnershipId: doc.partnership
        ? PartnershipId.from(doc.partnership.toString())
        : undefined,
      deleted: doc.deleted === true,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    message: Message
  ): Omit<MessageDocumentProps, "_id"> {
    return {
      conversation: new Types.ObjectId(message.conversationId),
      sender: new Types.ObjectId(message.senderId),
      content: message.content,
      readBy: message.readBy.map((id) => new Types.ObjectId(id)),
      partnership: message.partnershipId
        ? new Types.ObjectId(message.partnershipId)
        : undefined,
      deleted: message.deleted,
    };
  }
}
