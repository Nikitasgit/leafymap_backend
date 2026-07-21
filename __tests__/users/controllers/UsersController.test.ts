import { NextFunction, Response } from "express";
import UsersController from "@src/api/controllers/UsersController";
import { CustomRequest } from "@src/api/types/custom";
import UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import { ERROR_CODES } from "@src/shared/errors";

jest.mock("@src/api/http/response", () => ({
  APIResponse: jest.fn(),
}));

describe("UsersController.update", () => {
  const response: Response = Object.assign(Object.create(null), {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  });
  const next = jest.fn() as NextFunction;
  const execute = jest.fn().mockResolvedValue({});
  const updateUserUseCase: UpdateUserUseCase = Object.assign(
    Object.create(UpdateUserUseCase.prototype),
    { execute }
  );
  const controller = new UsersController(
    undefined as never,
    undefined as never,
    undefined as never,
    updateUserUseCase,
    undefined as never
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("validates and forwards an ordinary partial body", async () => {
    const request: CustomRequest = Object.assign(Object.create(null), {
      body: {
        firstname: " Alice ",
        preferences: { emailNotifications: true },
      },
      decoded: { id: "user-id", userType: "guest", role: "user" },
    });

    await controller.update()(request, response, next);

    expect(execute).toHaveBeenCalledWith({
      userId: "user-id",
      updateData: {
        firstname: " Alice ",
        preferences: { emailNotifications: true },
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects protected body fields before the use case", async () => {
    const request: CustomRequest = Object.assign(Object.create(null), {
      body: { role: "admin" },
      decoded: { id: "user-id", userType: "guest", role: "user" },
    });

    await controller.update()(request, response, next);

    expect(execute).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: ERROR_CODES.VALIDATION_ERROR })
    );
  });
});
