import { IMessageRepository } from "@src/domain/interfaces/IMessageRepository";

export const createMockMessageRepository =
  (): jest.Mocked<IMessageRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findPopulatedById: jest.fn(),
    findByConversation: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    markConversationAsRead: jest.fn(),
    hasUnreadInConversation: jest.fn(),
  });
