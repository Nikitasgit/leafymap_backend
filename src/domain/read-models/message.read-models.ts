/**
 * Typed read models for Message query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

export interface MessageSenderReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
}

export interface MessageListItem {
  id: string;
  conversation: string;
  sender?: MessageSenderReadModel | string;
  content?: string;
  readBy: string[];
  partnership?: unknown;
  createdAt: Date;
  updatedAt: Date;
}
