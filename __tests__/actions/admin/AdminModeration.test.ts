import bcrypt from "bcrypt";
import { Types } from "mongoose";
import SoftDeleteAdminResourceAction from "@/actions/admin/SoftDeleteAdminResource.action";

const createUserRepository = (user: any) =>
  ({
    findOne: jest.fn().mockResolvedValue(user),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  }) as any;

const createContentRepository = () =>
  ({
    findById: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
    updateOne: jest.fn(),
  }) as any;

describe("Admin moderation", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  it("rejects sign in for an active ban", async () => {
    const password = await bcrypt.hash("password", 10);
    const repository = createUserRepository({
      _id: new Types.ObjectId(),
      email: "user@test.com",
      username: "user",
      password,
      userType: "guest",
      role: "user",
      deleted: false,
      emailVerified: true,
      bannedAt: new Date(),
      banReason: "Spam",
      banExpiresAt: new Date(Date.now() + 60_000),
    });

    const { default: SignInAction } = await import(
      "@/actions/auth/SignIn.action"
    );
    const action = new SignInAction(repository);

    await expect(
      action.execute({
        signInData: { identifier: "user@test.com", password: "password" },
      })
    ).rejects.toThrow("Spam");
  });

  it("updates lastLogin after successful sign in", async () => {
    const password = await bcrypt.hash("password", 10);
    const repository = createUserRepository({
      _id: new Types.ObjectId(),
      email: "admin@test.com",
      username: "admin",
      password,
      userType: "guest",
      role: "admin",
      deleted: false,
      emailVerified: true,
    });

    const { default: SignInAction } = await import(
      "@/actions/auth/SignIn.action"
    );
    const action = new SignInAction(repository);
    const result = await action.execute({
      signInData: { identifier: "admin@test.com", password: "password" },
    });

    expect(result.user.role).toBe("admin");
    expect(repository.updateOne).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ lastLogin: expect.any(Date) })
    );
  });

  it("soft deletes content without hard deletion", async () => {
    const eventRepository = createContentRepository();
    const action = new SoftDeleteAdminResourceAction(
      eventRepository,
      createContentRepository(),
      createContentRepository(),
      createContentRepository(),
      createContentRepository()
    );

    await action.execute({
      adminId: new Types.ObjectId().toString(),
      resource: "events",
      resourceId: new Types.ObjectId().toString(),
      deleted: true,
      reason: "Moderation",
    });

    expect(eventRepository.updateOne).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ deleted: true, deleteReason: "Moderation" })
    );
    expect(eventRepository.deleteOne).toBeUndefined();
  });
});
