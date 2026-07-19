import { IConversationRepository } from "@src/domain/interfaces/IConversationRepository";

export const createMockConversationRepository =
  (): jest.Mocked<IConversationRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findBetweenUsers: jest.fn(),
    findIdsForUser: jest.fn(),
    findInboxForUser: jest.fn(),
    updateLastMessage: jest.fn(),
  });
