import { Request, Response, NextFunction } from "express";
import errorHandler from "@src/api/http/errorHandler";
import { AppError, ERROR_CODES, NotFoundError, ValidationError } from "@src/shared/errors";

jest.mock("@src/shared/logger", () => ({
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

  it("maps ValidationError to 400", () => {
    const response = createResponse();
    const error = new ValidationError(
      { field: "invalid" },
      ERROR_CODES.VALIDATION_ERROR,
      "Données invalides"
    );

    errorHandler(error, request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: "Données invalides",
      data: { field: "invalid" },
      code: ERROR_CODES.VALIDATION_ERROR,
    });
  });

  it("maps plain AppError to 500", () => {
    const response = createResponse();
    const error = new AppError(
      ERROR_CODES.PARTNERSHIP_CREATE_FAILED,
      "Failed to create partnership"
    );

    errorHandler(error, request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      message: "Failed to create partnership",
      data: null,
      code: ERROR_CODES.PARTNERSHIP_CREATE_FAILED,
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
