import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { Types } from "mongoose";
import { IConversation } from "@/types/models/conversation";

export interface Conversation {
  _id: string;
  participants: {
    _id: string;
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    image?: {
      urls: {
        thumbnail: string;
        medium: string;
      };
    };
  }[];
  lastMessage: {
    content?: string;
    partnership?:
      | string
      | {
          type?: "place" | "event";
        };
    createdAt: Date | string;
  };
  unreadCount: number;
}

export interface IGetConversationsAction {
  execute(params: { userId: string }): Promise<Conversation[]>;
}

class GetConversationsAction implements IGetConversationsAction {
  private readonly conversationProject: (keyof IConversation | string)[] = [
    "_id",
    "participants",
    "participants._id",
    "participants.username",
    "participants.firstname",
    "participants.lastname",
    "participants.email",
    "participants.image.urls",
    "lastMessage",
    "lastMessage.content",
    "lastMessage.partnership",
    "lastMessage.partnership.type",
    "lastMessage.createdAt",
    "updatedAt",
  ];
  constructor(
    private conversationRepository: IConversationRepository,
    private messageRepository: IMessageRepository
  ) {}

  async execute({ userId }: { userId: string }): Promise<Conversation[]> {
    const conversations = await this.conversationRepository.findAll({
      filters: {
        participants: userId,
      },
      project: this.conversationProject,
      sort: { updatedAt: -1 },
    });

    const result: Conversation[] = [];

    for (const conversation of conversations) {
      const unreadCount = await this.messageRepository.countAll({
        filters: {
          conversation: conversation._id.toString(),
          readBy: { $nin: [new Types.ObjectId(userId)] },
          sender: { $ne: new Types.ObjectId(userId) },
        },
      });

      (conversation as any).unreadCount = unreadCount;

      result.push(conversation as unknown as Conversation);
    }

    return result;
  }
}

export default GetConversationsAction;
