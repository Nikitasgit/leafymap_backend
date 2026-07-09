import { Request, Response } from "express";
import { GetUserByIdController } from "@/controllers/users";
import { IGetUserByIdAction } from "@/actions/users";
import { IUser } from "@/types/models/user";
import { Types } from "mongoose";
import { APIResponse } from "@/utils/response";
import { Controller } from "@/utils/controllerFactory";

jest.mock("@/utils/response", () => ({
  APIResponse: jest.fn(),
}));

describe("GetUserByIdController", () => {
  let mockAction: jest.Mocked<IGetUserByIdAction>;
  let controller: Controller;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockAction = {
      execute: jest.fn(),
    };
    controller = GetUserByIdController(mockAction);
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
      const userId = (mockRequest.params!.userId as string) ?? "";
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
        followers: 0,
        interests: [],
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

    it("should forward errors to next", async () => {
      const userId = mockRequest.params!.userId as string;
      const error = new Error("User not found");

      mockAction.execute = jest.fn().mockRejectedValue(error);

      const handler = controller.handle();
      await handler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockAction.execute).toHaveBeenCalledWith({ userId });
      expect(mockNext).toHaveBeenCalledWith(error);
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
        followers: 0,
        interests: [],
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
