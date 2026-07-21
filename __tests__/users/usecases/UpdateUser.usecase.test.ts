import { Types } from "mongoose";
import { UpdateUserInput } from "@src/application/dtos/users/updateUser.dto";
import UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { UserPreferences } from "@src/domain/value-objects/UserPreferences.vo";
import { ERROR_CODES } from "@src/shared/errors";
import { createMockUserRepository } from "../../helpers/mockUserRepository";

const mockObjectId = (): string => new Types.ObjectId().toString();

const buildUser = (id = mockObjectId()) =>
  User.reconstitute({
    id: UserId.from(id),
    email: "user@example.com",
    username: "guest",
    userType: "guest",
    role: "user",
    deleted: false,
    followers: 0,
    interestIds: [],
    preferences: UserPreferences.from({}),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe("UpdateUserUseCase", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtTokenIssuer: jest.Mocked<IJwtTokenIssuer>;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    userRepository = createMockUserRepository();
    jwtTokenIssuer = {
      issue: jest.fn().mockReturnValue("new-token"),
      verify: jest.fn(),
    } as jest.Mocked<IJwtTokenIssuer>;
    useCase = new UpdateUserUseCase(userRepository, jwtTokenIssuer);
  });

  it("updates the user profile", async () => {
    const userId = mockObjectId();
    const user = buildUser(userId);
    userRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({
      userId,
      updateData: { description: "hello" },
    });

    expect(result).toEqual({});
    expect(userRepository.update).toHaveBeenCalled();
  });

  it("normalizes names and builds profile value objects", async () => {
    const userId = mockObjectId();
    userRepository.findById.mockResolvedValue(buildUser(userId));

    await useCase.execute({
      userId,
      updateData: {
        firstname: " Alice ",
        lastname: " MARTIN ",
        address: { street: "rue des Fleurs", code: "75001" },
        preferences: { emailNotifications: true },
      },
    });

    const updatedUser = userRepository.update.mock.calls[0][0];
    expect(updatedUser.firstname).toBe("alice");
    expect(updatedUser.lastname).toBe("martin");
    expect(updatedUser.address).toMatchObject({
      street: "rue des Fleurs",
      code: "75001",
    });
    expect(updatedUser.preferences.emailNotifications).toBe(true);
  });

  it("returns a token when userType changes", async () => {
    const userId = mockObjectId();
    const user = buildUser(userId);
    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(
        user.updateProfile({ userType: "creator", username: "creator" })
      );

    const result = await useCase.execute({
      userId,
      updateData: {
        userType: "creator",
        username: "creator",
      },
    });

    expect(result).toEqual({ token: "new-token" });
    expect(jwtTokenIssuer.issue).toHaveBeenCalled();
  });

  it("does not issue a token when userType is unchanged", async () => {
    const userId = mockObjectId();
    userRepository.findById.mockResolvedValue(buildUser(userId));

    const result = await useCase.execute({
      userId,
      updateData: { userType: "guest" },
    });

    expect(result).toEqual({});
    expect(jwtTokenIssuer.issue).not.toHaveBeenCalled();
  });

  it("returns a validation error for malformed runtime preferences", async () => {
    const userId = mockObjectId();
    userRepository.findById.mockResolvedValue(buildUser(userId));
    const malformedInput: UpdateUserInput = JSON.parse(
      JSON.stringify({
        userId,
        updateData: { preferences: { emailNotifications: "yes" } },
      })
    );

    await expect(useCase.execute(malformedInput)).rejects.toMatchObject({
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  });

  it("throws when the user is not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: mockObjectId(),
        updateData: { description: "x" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.USER_NOT_FOUND,
    });
  });
});
