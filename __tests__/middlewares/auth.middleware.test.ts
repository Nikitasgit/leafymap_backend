import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "@src/domain/entities/User.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import AuthMiddleware from "@src/api/middlewares/auth.middleware";
import { CustomRequest } from "@src/api/types/custom";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";
import { createMockUserRepository } from "../helpers/mockUserRepository";

jest.mock("jsonwebtoken");

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
  let middleware: AuthMiddleware;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    userRepository = createMockUserRepository();
    middleware = new AuthMiddleware(userRepository);
    (jwt.verify as jest.Mock).mockReturnValue({
      id: userId,
      userType: "guest",
    });
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
        code: ERROR_CODES.USER_NOT_FOUND,
      })
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(UnauthorizedError);
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
        code: ERROR_CODES.USER_NOT_FOUND,
      })
    );
  });
});
