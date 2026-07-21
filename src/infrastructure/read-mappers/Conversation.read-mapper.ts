import {
  ConversationInboxItemReadModel,
  ConversationLastMessageReadModel,
  ConversationParticipantReadModel,
} from "@src/domain/read-models/conversation.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

type NormalizedParticipant = string | (Record<string, unknown> & { id: string });
type NormalizedLastMessage = string | (Record<string, unknown> & { id: string });

interface NormalizedConversationDoc {
  id: string;
  participants?: NormalizedParticipant[];
  lastMessage?: NormalizedLastMessage | null;
  updatedAt?: Date;
}

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the populated participant/lastMessage subdocuments into the typed
 * read model expected by the API.
 */
export class ConversationReadMapper {
  static toInboxItem(
    doc: unknown,
    unreadCount: number
  ): ConversationInboxItemReadModel {
    const normalized = normalizeLeanDocument<NormalizedConversationDoc>(doc);

    return {
      id: normalized.id,
      participants: (normalized.participants ?? []).map((participant) =>
        ConversationReadMapper.mapParticipant(participant)
      ),
      lastMessage: ConversationReadMapper.mapLastMessage(normalized.lastMessage),
      unreadCount,
      updatedAt: normalized.updatedAt,
    };
  }

  private static mapParticipant(
    participant: NormalizedParticipant
  ): ConversationParticipantReadModel {
    if (typeof participant === "string") {
      return { id: participant };
    }

    return {
      id: participant.id,
      username: participant.username as string | undefined,
      firstname: participant.firstname as string | undefined,
      lastname: participant.lastname as string | undefined,
      email: participant.email as string | undefined,
      image: participant.image as ConversationParticipantReadModel["image"],
    };
  }

  private static mapLastMessage(
    lastMessage: NormalizedLastMessage | null | undefined
  ): ConversationLastMessageReadModel | undefined {
    if (!lastMessage || typeof lastMessage === "string") {
      return undefined;
    }
    if (!(lastMessage.createdAt instanceof Date) && typeof lastMessage.createdAt !== "string") {
      throw new Error("Conversation last message read model is missing createdAt");
    }

    let partnership: ConversationLastMessageReadModel["partnership"];
    if (typeof lastMessage.partnership === "string") {
      partnership = lastMessage.partnership;
    } else if (
      lastMessage.partnership &&
      typeof lastMessage.partnership === "object"
    ) {
      partnership = {
        type: (lastMessage.partnership as { type?: "place" | "event" }).type,
      };
    }

    return {
      content: lastMessage.content as string | undefined,
      partnership,
      createdAt: lastMessage.createdAt as Date | string,
    };
  }
}
