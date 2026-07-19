import { Types } from "mongoose";
import BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES, ForbiddenError } from "@src/shared/errors";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

describe("BanAdminUserUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: BanAdminUserUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    useCase = new BanAdminUserUseCase(userRepository);
  });

  it("forbids self-ban", async () => {
    const adminId = mockObjectId();

    await expect(
      useCase.execute({
        adminId,
        userId: adminId,
        reason: "nope",
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.ADMIN_SELF_BAN_FORBIDDEN,
    });
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("no-ops when user does not exist", async () => {
    userRepository.findById.mockResolvedValue(null);

    await useCase.execute({
      adminId: mockObjectId(),
      userId: mockObjectId(),
      reason: "spam",
    });

    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("bans an existing user", async () => {
    const user = buildUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute({
      adminId: mockObjectId(),
      userId: user.id!,
      reason: "spam",
      duration: 1000,
    });

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        banReason: "spam",
        banDuration: 1000,
        bannedAt: expect.any(Date),
      })
    );
  });

  it("throws ForbiddenError instance on self-ban", async () => {
    const adminId = mockObjectId();
    await expect(
      useCase.execute({ adminId, userId: adminId, reason: "x" })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
