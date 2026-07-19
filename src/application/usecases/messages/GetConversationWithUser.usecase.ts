import {
  GetConversationWithUserInput,
  GetConversationWithUserResult,
} from "@src/application/dtos/messages/getConversationWithUser.dto";
import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

class GetConversationWithUserUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    params: GetConversationWithUserInput
  ): Promise<GetConversationWithUserResult> {
    const conversation = await this.conversationRepository.findBetweenUsers(
      UserId.from(params.userId),
      UserId.from(params.otherUserId)
    );

    return {
      conversationId: conversation?.id ?? null,
    };
  }
}

export default GetConversationWithUserUseCase;
