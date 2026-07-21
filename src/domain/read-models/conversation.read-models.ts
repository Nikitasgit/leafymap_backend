/**
 * Typed read models for Conversation query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface ConversationParticipantReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      thumbnail?: string;
      medium?: string;
      original?: string;
    };
  };
}

export interface ConversationLastMessageReadModel {
  content?: string;
  partnership?:
    | string
    | {
        type?: "place" | "event";
      };
  createdAt: Date | string;
}

export interface ConversationInboxItem {
  id: string;
  participants: ConversationParticipantReadModel[];
  lastMessage?: ConversationLastMessageReadModel;
  unreadCount: number;
  updatedAt?: Date;
}
