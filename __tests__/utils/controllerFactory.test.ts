import { Response, NextFunction } from "express";
import { z } from "zod";
import { CustomRequest } from "@/types/custom";
import {
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";
import { ERROR_CODES, NotFoundError } from "@/utils/errors";
import { APIResponse } from "@/utils/response";

jest.mock("@/utils/response", () => ({
  APIResponse: jest.fn(),
}));

describe("controllerFactory", () => {
  describe("requireAuth", () => {
    it("throws UNAUTHORIZED when the request has no decoded token", () => {
      const req = { decoded: undefined } as CustomRequest;

      expect(() => requireAuth(req)).toThrow(
        expect.objectContaining({
          code: ERROR_CODES.UNAUTHORIZED,
          statusCode: 401,
        })
      );
    });

    it("returns the decoded token when authenticated", () => {
      const decoded = { id: "user-id", role: "user" };
      const req = { decoded } as CustomRequest;

      expect(requireAuth(req)).toEqual(decoded);
    });
  });

  describe("requireObjectIdParam", () => {
    it("throws INVALID_ROUTE_PARAM for an invalid id", () => {
      const req = {
        params: { eventId: "not-an-object-id" },
      } as unknown as CustomRequest;

      expect(() => requireObjectIdParam(req, "eventId")).toThrow(
        expect.objectContaining({
          code: ERROR_CODES.INVALID_ROUTE_PARAM,
          statusCode: 400,
          data: { param: "eventId" },
        })
      );
    });

    it("returns a valid ObjectId string", () => {
      const eventId = "507f1f77bcf86cd799439011";
      const req = { params: { eventId } } as unknown as CustomRequest;

      expect(requireObjectIdParam(req, "eventId")).toBe(eventId);
    });
  });

  describe("validateOrThrow", () => {
    const schema = z.object({ name: z.string().min(1) });

    it("throws VALIDATION_ERROR with field errors on failure", () => {
      expect(() => validateOrThrow(schema, { name: "" })).toThrow(
        expect.objectContaining({
          code: ERROR_CODES.VALIDATION_ERROR,
          statusCode: 400,
          data: { name: expect.any(String) },
        })
      );
    });

    it("returns parsed data on success", () => {
      const result = validateOrThrow(schema, { name: "Test" });

      expect(result).toEqual({ name: "Test" });
    });
  });

  describe("createController", () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;
    const mockNext = jest.fn() as NextFunction;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("forwards errors to next", async () => {
      const error = new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
      const controller = createController({
        execute: async () => {
          throw error;
        },
        successMessage: "ok",
      });

      await controller
        .handle()( {} as CustomRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(APIResponse).not.toHaveBeenCalled();
    });

    it("returns a success response through APIResponse", async () => {
      const controller = createController({
        execute: async () => ({ id: "1" }),
        successMessage: "Created",
        successStatus: 201,
        mapResult: (result) => ({ item: result }),
      });

      await controller
        .handle()( {} as CustomRequest, mockResponse as Response, mockNext);

      expect(APIResponse).toHaveBeenCalledWith(
        mockResponse,
        { item: { id: "1" } },
        "Created",
        201
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
