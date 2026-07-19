import {
  GetConversationsInput,
  GetConversationsResult,
} from "@src/application/dtos/messages/getConversations.dto";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class GetConversationsUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(params: GetConversationsInput): Promise<GetConversationsResult> {
    return this.conversationRepository.findInboxForUser(
      UserId.from(params.userId)
    );
  }
}

export default GetConversationsUseCase;
