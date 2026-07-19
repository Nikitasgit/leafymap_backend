import { Types } from "mongoose";
import { User } from "@src/domain/entities/User.entity";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import AdminMiddleware from "@src/api/middlewares/admin.middleware";
import { CustomRequest } from "@src/api/types/custom";
import { ERROR_CODES, ForbiddenError } from "@src/shared/errors";
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

describe("AdminMiddleware", () => {
  const userId = mockObjectId();
  let userRepository: ReturnType<typeof createMockUserRepository>;
  let middleware: AdminMiddleware;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = createMockUserRepository();
    middleware = new AdminMiddleware(userRepository);
  });

  const runRequireAdmin = async (req: Partial<CustomRequest> = {}) => {
    const handler = middleware.requireAdmin();
    await handler(
      {
        decoded: { id: userId, userType: "guest" },
        ...req,
      } as CustomRequest,
      {} as never,
      next
    );
  };

  it("allows an admin user", async () => {
    userRepository.findById.mockResolvedValue(
      buildUser({ id: UserId.from(userId), role: "admin" })
    );

    await runRequireAdmin();

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a non-admin user", async () => {
    userRepository.findById.mockResolvedValue(
      buildUser({ id: UserId.from(userId), role: "user" })
    );

    await runRequireAdmin();

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ERROR_CODES.FORBIDDEN,
      })
    );
    expect(next.mock.calls[0][0]).toBeInstanceOf(ForbiddenError);
  });

  it("rejects a deleted admin", async () => {
    userRepository.findById.mockResolvedValue(
      buildUser({ id: UserId.from(userId), role: "admin", deleted: true })
    );

    await runRequireAdmin();

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        code: ERROR_CODES.FORBIDDEN,
      })
    );
  });
});
