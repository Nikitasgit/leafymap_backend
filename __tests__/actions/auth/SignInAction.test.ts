import bcrypt from "bcrypt";
import SignInAction from "@/actions/auth/SignIn.action";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import { buildUser, createMockRepository } from "../../helpers/mockRepositories";

describe("SignInAction", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let action: SignInAction;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    userRepository = createMockRepository<IUserRepository>();
    action = new SignInAction(userRepository);
  });

  it("returns user and token on successful sign in and updates lastLogin", async () => {
    const password = await bcrypt.hash("password", 10);
    const user = buildUser({
      email: "admin@test.com",
      username: "admin",
      password,
      role: "admin",
    });

    userRepository.findOne.mockResolvedValue(user as never);

    const result = await action.execute({
      signInData: { identifier: "admin@test.com", password: "password" },
    });

    expect(result.user.role).toBe("admin");
    expect(result.token).toBeDefined();
    expect(userRepository.updateOne).toHaveBeenCalledWith(
      user._id!.toString(),
      expect.objectContaining({ lastLogin: expect.any(Date) })
    );
  });

  it("rejects invalid credentials when user is not found", async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      action.execute({
        signInData: { identifier: "unknown@test.com", password: "password" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      statusCode: 401,
    });

    expect(userRepository.updateOne).not.toHaveBeenCalled();
  });

  it("rejects invalid credentials when password is wrong", async () => {
    const password = await bcrypt.hash("password", 10);
    userRepository.findOne.mockResolvedValue(
      buildUser({ email: "user@test.com", password }) as never
    );

    await expect(
      action.execute({
        signInData: { identifier: "user@test.com", password: "wrong-password" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      statusCode: 401,
    });
  });

  it("rejects sign in when email is not verified", async () => {
    const password = await bcrypt.hash("password", 10);
    userRepository.findOne.mockResolvedValue(
      buildUser({ email: "user@test.com", password, emailVerified: false }) as never
    );

    await expect(
      action.execute({
        signInData: { identifier: "user@test.com", password: "password" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
      statusCode: 403,
    });
  });

  it("rejects sign in for an active ban", async () => {
    const password = await bcrypt.hash("password", 10);
    userRepository.findOne.mockResolvedValue(
      buildUser({
        email: "user@test.com",
        password,
        bannedAt: new Date(),
        banReason: "Spam",
        banExpiresAt: new Date(Date.now() + 60_000),
      }) as never
    );

    await expect(
      action.execute({
        signInData: { identifier: "user@test.com", password: "password" },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_USER_BANNED,
      statusCode: 403,
    });
  });
});
