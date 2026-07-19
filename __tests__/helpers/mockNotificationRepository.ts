import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";

export const createMockNotificationRepository =
  (): jest.Mocked<INotificationRepository> => ({
    save: jest.fn(),
    findRecentForReceiver: jest.fn(),
    markAsReadByAction: jest.fn(),
    markAllAsRead: jest.fn(),
    existsRecentSimilar: jest.fn(),
    deleteByReferences: jest.fn(),
    deleteByUser: jest.fn(),
  });
