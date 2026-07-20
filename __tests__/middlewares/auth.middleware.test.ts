import { Types } from "mongoose";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import AuthMiddleware from "@src/api/middlewares/auth.middleware";
import { CustomRequest } from "@src/api/types/custom";
import {
  ERROR_CODES,
  ForbiddenError,
  UnauthorizedError,
} from "@src/shared/errors";
import { createMockUserRepository } from "../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (
  overrides: Partial<Parameters<typeof User.reconstitute>[0]> = {}
) =>
  User.reconstitute({
    id: UserId.from(mockObjectId()),
    email: "user@example.com",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  });

describe("AuthMiddleware", () => {
  const userId = mockObjectId();
  let userRepository: ReturnType<typeof createMockUserRepository>;
  let jwtTokenIssuer: jest.Mocked<IJwtTokenIssuer>;
  let middleware: AuthMiddleware;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = createMockUserRepository();
    jwtTokenIssuer = {
      issue: jest.fn(),
      verify: jest.fn().mockReturnValue({
        id: userId,
        userType: "guest",
      }),
    };
    middleware = new AuthMiddleware(jwtTokenIssuer, userRepository);
  });

  const runVerify = async (req: Partial<CustomRequest> = {}) => {
    const handler = middleware.verify();
    await handler(
      {
        cookies: { token: "token" },
        headers: {},
        ...req,
      } as CustomRequest,
      {} as never,
      next
    );
  };

  it("allows an active user", async () => {
    userRepository.findById.mockResolvedValue(buildUser({ id: UserId.from(userId) }));

    await runVerify();

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a deleted user", async () => {
    userRepository.findById.mockResolvedValue(
      buildUser({ id: UserId.from(userId), deleted: true })
    );

    await runVerify();

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ERROR_CODES.AUTH_ACCOUNT_INACCESSIBLE,
      })
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
  });

  it("rejects a banned user", async () => {
    userRepository.findById.mockResolvedValue(
      buildUser({
        id: UserId.from(userId),
        bannedAt: new Date(),
        banExpiresAt: undefined,
      })
    );

    await runVerify();

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ERROR_CODES.AUTH_USER_BANNED,
      })
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
  });

  it("rejects when user is not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await runVerify();

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ERROR_CODES.USER_NOT_FOUND,
      })
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
  });
});
