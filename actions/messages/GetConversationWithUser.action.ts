import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { IConversation } from "@/types/models/conversation";

export interface IGetConversationWithUserAction {
  execute(params: {
    userId: string;
    otherUserId: string;
  }): Promise<{ conversationId: string | null }>;
}

class GetConversationWithUserAction implements IGetConversationWithUserAction {
  private readonly conversationProject: (keyof IConversation | string)[] = [
    "_id",
  ];

  constructor(private conversationRepository: IConversationRepository) {}

  async execute({
    userId,
    otherUserId,
  }: {
    userId: string;
    otherUserId: string;
  }): Promise<{ conversationId: string | null }> {
    const conversation = await this.conversationRepository.findOne(
      {
        participants: {
          $all: [userId, otherUserId],
        },
      } as any,
      this.conversationProject
    );

    if (conversation) {
      return { conversationId: conversation._id.toString() };
    }

    return { conversationId: null };
  }
}

export default GetConversationWithUserAction;
