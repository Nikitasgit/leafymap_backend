import { Request, Response, NextFunction } from "express";
import errorHandler from "@/utils/errorHandler";
import { ERROR_CODES, NotFoundError } from "@/utils/errors";

jest.mock("@/utils/logger", () => ({
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

describe("errorHandler", () => {
  const createResponse = () =>
    ({
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }) as Partial<Response>;

  const request = {
    method: "GET",
    originalUrl: "/api/test",
  } as Request;

  const next: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stable error codes for AppError instances", () => {
    const response = createResponse();
    const error = new NotFoundError(
      ERROR_CODES.USER_NOT_FOUND,
      "User not found"
    );

    errorHandler(error, request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: "User not found",
      data: null,
      code: ERROR_CODES.USER_NOT_FOUND,
    });
  });

  it("returns a generic code for unknown errors", () => {
    const response = createResponse();

    errorHandler(new Error("Unexpected failure"), request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      message: "Unexpected failure",
      data: null,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  });
});
