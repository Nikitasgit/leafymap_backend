import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserRepository } from "@/repositories";
import User from "../../../models/User";
import { Types } from "mongoose";

describe("UserRepository", () => {
  let mongoServer: MongoMemoryServer;
  let repository: UserRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    repository = new UserRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      const userId = await repository.create(userData);
      expect(userId).toBeInstanceOf(Types.ObjectId);

      const user = await User.findById(userId);
      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
      expect(user?.username).toBe(userData.username);
    });

    it("should create a user with optional fields", async () => {
      const userData = {
        email: "creator@example.com",
        username: "creator",
        password: "hashedpassword",
        userType: "creator" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
        firstname: "John",
        lastname: "Doe",
        description: "I am a creator",
      };

      const userId = await repository.create(userData);
      const user = await User.findById(userId);
      expect(user?.firstname).toBe(userData.firstname);
      expect(user?.lastname).toBe(userData.lastname);
      expect(user?.description).toBe(userData.description);
    });
  });

  describe("findById", () => {
    it("should find a user by id", async () => {
      const userData = {
        email: "find@example.com",
        username: "finduser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      const createdUser = await User.create(userData);
      const foundUser = await repository.findById(createdUser._id.toString());

      expect(foundUser).toBeTruthy();
      expect(foundUser?._id.toString()).toBe(createdUser._id.toString());
      expect(foundUser?.email).toBe(userData.email);
      expect(foundUser?.username).toBe(userData.username);
    });

    it("should return null if user not found", async () => {
      const nonExistentId = new Types.ObjectId().toString();
      const foundUser = await repository.findById(nonExistentId);
      expect(foundUser).toBeNull();
    });

    it("should project specific fields", async () => {
      const userData = {
        email: "project@example.com",
        username: "projectuser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      const createdUser = await User.create(userData);
      const foundUser = await repository.findById(createdUser._id.toString(), [
        "email",
        "username",
      ]);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.email).toBe(userData.email);
      expect(foundUser?.username).toBe(userData.username);
    });
  });

  describe("findOne", () => {
    it("should find a user by email", async () => {
      const userData = {
        email: "findone@example.com",
        username: "findoneuser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      await User.create(userData);
      const foundUser = await repository.findOne({ email: userData.email });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.email).toBe(userData.email);
    });

    it("should find a user using $or operator", async () => {
      const userData = {
        email: "or@example.com",
        username: "oruser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      await User.create(userData);
      const foundUser = await repository.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
      });

      expect(foundUser).toBeTruthy();
      expect(foundUser?.email).toBe(userData.email);
    });

    it("should return null if user not found", async () => {
      const foundUser = await repository.findOne({
        email: "nonexistent@example.com",
      });
      expect(foundUser).toBeNull();
    });
  });

  describe("findAll", () => {
    beforeEach(async () => {
      await User.create([
        {
          email: "user1@example.com",
          username: "user1",
          password: "hashedpassword",
          userType: "guest",
          deleted: false,
          acceptedCGU: true,
          acceptedAt: new Date(),
        },
        {
          email: "user2@example.com",
          username: "user2",
          password: "hashedpassword",
          userType: "creator",
          deleted: false,
          acceptedCGU: true,
          acceptedAt: new Date(),
        },
        {
          email: "deleted@example.com",
          username: "deleteduser",
          password: "hashedpassword",
          userType: "guest",
          deleted: true,
          acceptedCGU: true,
          acceptedAt: new Date(),
        },
      ]);
    });

    it("should find all users with filters", async () => {
      const users = await repository.findAll({
        filters: { deleted: false },
        project: ["email", "username", "userType", "deleted"],
      });

      expect(users.length).toBe(2);
      expect(users.every((u) => u.deleted === false)).toBe(true);
    });

    it("should filter by userType", async () => {
      const users = await repository.findAll({
        filters: { userType: "creator" },
        project: ["email", "username", "userType"],
      });

      expect(users.length).toBe(1);
      expect(users[0].userType).toBe("creator");
    });

    it("should limit results", async () => {
      const users = await repository.findAll({
        filters: { deleted: false },
        project: ["email", "username"],
        limit: 1,
      });

      expect(users.length).toBe(1);
    });

    it("should sort results", async () => {
      const users = await repository.findAll({
        filters: { deleted: false },
        project: ["username"],
        sort: { username: 1 },
      });

      expect(users.length).toBe(2);
      expect(users[0].username).toBe("user1");
      expect(users[1].username).toBe("user2");
    });
  });

  describe("updateOne", () => {
    it("should update a user", async () => {
      const userData = {
        email: "update@example.com",
        username: "updateuser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      const createdUser = await User.create(userData);
      const updateData = {
        firstname: "Updated",
        lastname: "Name",
      };

      await repository.updateOne(createdUser._id.toString(), updateData);
      const updatedUser = await User.findById(createdUser._id);

      expect(updatedUser?.firstname).toBe(updateData.firstname);
      expect(updatedUser?.lastname).toBe(updateData.lastname);
      expect(updatedUser?.email).toBe(userData.email); // Other fields unchanged
    });
  });

  describe("deleteOne", () => {
    it("should delete a user", async () => {
      const userData = {
        email: "delete@example.com",
        username: "deleteuser",
        password: "hashedpassword",
        userType: "guest" as const,
        deleted: false,
        acceptedCGU: true,
        acceptedAt: new Date(),
      };

      const createdUser = await User.create(userData);
      await repository.deleteOne(createdUser._id.toString());

      const deletedUser = await User.findById(createdUser._id);
      expect(deletedUser).toBeNull();
    });
  });
});
