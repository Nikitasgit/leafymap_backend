import { Request, Response } from "express";
import { GetUserByIdController } from "@/controllers/users";
import { IGetUserByIdAction } from "@/actions/users";
import { IUser } from "@/types/models/user";
import { Types } from "mongoose";
import { APIResponse } from "@/utils/response";

// Mock the APIResponse function
jest.mock("@/utils/response", () => ({
  APIResponse: jest.fn(),
}));

// Mock the logger
jest.mock("@/utils/logger", () => ({
  error: jest.fn(),
}));

describe("GetUserByIdController", () => {
  let mockAction: jest.Mocked<IGetUserByIdAction>;
  let controller: GetUserByIdController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockAction = {
      execute: jest.fn(),
    };
    controller = new GetUserByIdController(mockAction);
    mockRequest = {
      params: {
        userId: new Types.ObjectId().toString(),
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("handle", () => {
    it("should return user data on success", async () => {
      const userId = mockRequest.params!.userId;
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

      mockAction.execute = jest.fn().mockResolvedValue(mockUser as IUser);

      const handler = controller.handle();
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAction.execute).toHaveBeenCalledWith({ userId });
      expect(APIResponse).toHaveBeenCalledWith(
        mockResponse,
        { user: mockUser },
        "User fetched successfully",
        200
      );
    });

    it("should handle errors correctly", async () => {
      const userId = mockRequest.params!.userId;
      const errorMessage = "User not found";

      mockAction.execute = jest.fn().mockRejectedValue(new Error(errorMessage));

      const handler = controller.handle();
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAction.execute).toHaveBeenCalledWith({ userId });
      expect(APIResponse).toHaveBeenCalledWith(
        mockResponse,
        null,
        errorMessage,
        500
      );
    });

    it("should handle non-Error exceptions", async () => {
      const userId = mockRequest.params!.userId;

      mockAction.execute = jest.fn().mockRejectedValue("Unexpected error");

      const handler = controller.handle();
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAction.execute).toHaveBeenCalledWith({ userId });
      expect(APIResponse).toHaveBeenCalledWith(
        mockResponse,
        null,
        "Server error",
        500
      );
    });

    it("should extract userId from request params", async () => {
      const userId = "507f1f77bcf86cd799439011";
      mockRequest.params = { userId };

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

      mockAction.execute = jest.fn().mockResolvedValue(mockUser as IUser);

      const handler = controller.handle();
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAction.execute).toHaveBeenCalledWith({ userId });
    });
  });
});
