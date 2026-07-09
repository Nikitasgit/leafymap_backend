import { Types } from "mongoose";
import RegisterAction from "@/actions/auth/Register.action";
import EmailService from "@/services/emailService";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES } from "@/utils/errors";
import { buildUser, createMockRepository } from "../../helpers/mockRepositories";

const mockSendEmailVerification = jest.fn().mockResolvedValue(undefined);

jest.mock("@/services/emailService", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendEmailVerification: mockSendEmailVerification,
  })),
}));

describe("RegisterAction", () => {
  let userRepository: jest.Mocked<IUserRepository>;
  let action: RegisterAction;

  beforeEach(() => {
    mockSendEmailVerification.mockClear();
    userRepository = createMockRepository<IUserRepository>();
    action = new RegisterAction(userRepository);
  });

  it("creates a new user and sends a verification email", async () => {
    const userId = new Types.ObjectId();
    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(userId);

    const result = await action.execute({
      registerData: {
        email: "new@test.com",
        password: "Password1",
        acceptedCGU: true,
        emailNotifications: true,
      },
    });

    expect(result).toEqual({ _id: userId.toString() });
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@test.com",
        acceptedCGU: true,
        userType: "guest",
        preferences: { emailNotifications: true },
      })
    );
    expect(mockSendEmailVerification).toHaveBeenCalledWith(
      "new@test.com",
      expect.any(String)
    );
    expect(EmailService).toHaveBeenCalled();
  });

  it("rejects registration when email is already used and verified", async () => {
    userRepository.findOne.mockResolvedValue(buildUser({ emailVerified: true }) as never);

    await expect(
      action.execute({
        registerData: {
          email: "existing@test.com",
          password: "Password1",
          acceptedCGU: true,
        },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.AUTH_EMAIL_ALREADY_USED,
      statusCode: 409,
    });

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(mockSendEmailVerification).not.toHaveBeenCalled();
  });

  it("resends verification for an existing unverified user without creating a new one", async () => {
    const existingUser = buildUser({
      email: "unverified@test.com",
      emailVerified: false,
      preferences: { emailNotifications: false },
    });
    userRepository.findOne.mockResolvedValue(existingUser as never);

    const result = await action.execute({
      registerData: {
        email: "unverified@test.com",
        password: "Password1",
        acceptedCGU: true,
        emailNotifications: true,
      },
    });

    expect(result).toEqual({ _id: existingUser._id!.toString() });
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(userRepository.updateOne).toHaveBeenCalledWith(
      existingUser._id!.toString(),
      expect.objectContaining({
        emailVerificationTokenHash: expect.any(String),
        emailVerificationExpiresAt: expect.any(Date),
        preferences: { emailNotifications: true },
      })
    );
    expect(mockSendEmailVerification).toHaveBeenCalledWith(
      "unverified@test.com",
      expect.any(String)
    );
  });
});
