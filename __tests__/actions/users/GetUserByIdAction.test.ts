import { IUserRepository } from "../../../repositories/users/IUserRepository";
import GetUserByIdAction from "../../../actions/users/GetUserByIdAction";
import { IUser } from "../../../types/models/user";
import { Types } from "mongoose";

describe("GetUserByIdAction", () => {
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let action: GetUserByIdAction;

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    action = new GetUserByIdAction(mockUserRepository);
  });

  describe("execute", () => {
    it("should return a user when found", async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser: Partial<IUser> = {
        _id: new Types.ObjectId(userId),
        username: "testuser",
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        userType: "guest",
        deleted: false,
        password: "hashed",
        acceptedCGU: true,
        acceptedAt: new Date(),
        rating: 0,
        followers: [],
        interests: [],
        places: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUser as IUser);

      const result = await action.execute({ userId });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        { _id: userId, deleted: false },
        expect.any(Array)
      );
    });

    it("should use custom project fields when provided", async () => {
      const userId = new Types.ObjectId().toString();
      const customProject = ["email", "username"];
      const mockUser: Partial<IUser> = {
        _id: new Types.ObjectId(userId),
        username: "testuser",
        email: "test@example.com",
        userType: "guest",
        deleted: false,
        password: "hashed",
        acceptedCGU: true,
        acceptedAt: new Date(),
        rating: 0,
        followers: [],
        interests: [],
        places: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUser as IUser);

      await action.execute({ userId, project: customProject });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        { _id: userId, deleted: false },
        customProject
      );
    });

    it("should throw an error when user is not found", async () => {
      const userId = new Types.ObjectId().toString();

      mockUserRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(action.execute({ userId })).rejects.toThrow(
        "User not found"
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        { _id: userId, deleted: false },
        expect.any(Array)
      );
    });

    it("should use default project fields when not provided", async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser: Partial<IUser> = {
        _id: new Types.ObjectId(userId),
        username: "testuser",
        email: "test@example.com",
        userType: "guest",
        deleted: false,
        password: "hashed",
        acceptedCGU: true,
        acceptedAt: new Date(),
        rating: 0,
        followers: [],
        interests: [],
        places: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockUser as IUser);

      await action.execute({ userId });

      // Verify default project fields are used
      const callArgs = (mockUserRepository.findOne as jest.Mock).mock.calls[0];
      const projectFields = callArgs[1];
      expect(projectFields).toContain("_id");
      expect(projectFields).toContain("username");
      expect(projectFields).toContain("firstname");
      expect(projectFields).toContain("lastname");
      expect(projectFields).toContain("creatorName");
    });
  });
});
