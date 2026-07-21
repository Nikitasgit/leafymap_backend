import {
  MessageListItemReadModel,
  MessagePartnershipReadModel,
  MessageSenderReadModel,
} from "@src/domain/read-models/message.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

type NormalizedSender = string | (Record<string, unknown> & { id: string });

interface NormalizedMessageDoc {
  id: string;
  conversation: string;
  sender?: NormalizedSender;
  content?: string;
  readBy?: string[];
  partnership?: MessagePartnershipReadModel | string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the populated sender subdocument into the typed read model
 * expected by the API.
 */
export class MessageReadMapper {
  static toListItem(doc: unknown): MessageListItemReadModel {
    const normalized = normalizeLeanDocument<NormalizedMessageDoc>(doc);

    return {
      id: normalized.id,
      conversation: normalized.conversation,
      sender: MessageReadMapper.mapSender(normalized.sender),
      content: normalized.content,
      readBy: normalized.readBy ?? [],
      partnership: normalized.partnership,
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
    };
  }

  static toListItems(docs: unknown[]): MessageListItemReadModel[] {
    return docs.map((doc) => MessageReadMapper.toListItem(doc));
  }

  private static mapSender(
    sender: NormalizedSender | undefined
  ): MessageSenderReadModel | string | undefined {
    if (!sender) {
      return undefined;
    }
    if (typeof sender === "string") {
      return sender;
    }

    return {
      id: sender.id,
      username: sender.username as string | undefined,
      firstname: sender.firstname as string | undefined,
      lastname: sender.lastname as string | undefined,
      email: sender.email as string | undefined,
      image: sender.image as MessageSenderReadModel["image"],
    };
  }
}
