import {
  ImageReferenceReadModel,
  ReadModelDate,
} from "@src/domain/read-models/shared.read-models";

export interface ConversationParticipantReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  image?: ImageReferenceReadModel | string | null;
}

export interface ConversationLastMessageReadModel {
  content?: string;
  partnership?:
    | string
    | {
        type?: "place" | "event";
      };
  createdAt: ReadModelDate;
}

export interface ConversationInboxItemReadModel {
  id: string;
  participants: ConversationParticipantReadModel[];
  lastMessage?: ConversationLastMessageReadModel;
  unreadCount: number;
  updatedAt?: Date;
}
