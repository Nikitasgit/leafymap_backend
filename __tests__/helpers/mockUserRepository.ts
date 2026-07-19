import { IUserRepository } from "@src/domain/interfaces/IUserRepository";

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => ({
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailOrUsername: jest.fn(),
  findByGoogleId: jest.fn(),
  findByEmailVerificationTokenHash: jest.fn(),
  findByResetPasswordTokenHash: jest.fn(),
  findDetailsById: jest.fn(),
  findList: jest.fn(),
  findAdminByEmail: jest.fn(),
  incrementFollowers: jest.fn(),
  deleteOne: jest.fn(),
  linkPlace: jest.fn(),
  unlinkPlace: jest.fn(),
});
