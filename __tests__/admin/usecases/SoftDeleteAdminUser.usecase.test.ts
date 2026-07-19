import { Types } from "mongoose";
import SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES } from "@src/shared/errors";
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

describe("SoftDeleteAdminUserUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: SoftDeleteAdminUserUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    useCase = new SoftDeleteAdminUserUseCase(userRepository);
  });

  it("forbids self-delete", async () => {
    const adminId = mockObjectId();

    await expect(
      useCase.execute({ adminId, userId: adminId })
    ).rejects.toMatchObject({
      code: ERROR_CODES.ADMIN_SELF_DELETE_FORBIDDEN,
    });
  });

  it("throws 404 when user is missing", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        adminId: mockObjectId(),
        userId: mockObjectId(),
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_NOT_FOUND,
    });
  });

  it("soft deletes an existing user", async () => {
    const user = buildUser();
    userRepository.findById.mockResolvedValue(user);

    await useCase.execute({
      adminId: mockObjectId(),
      userId: user.id!,
    });

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ deleted: true })
    );
  });
});
