import { Response, NextFunction, RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { CustomRequest, IDecodedToken } from "@/types/custom";
import { APIResponse } from "./response";
import { getParam } from "./request";
import { validateData } from "./validation";
import {
  AppError,
  ERROR_CODES,
  UnauthorizedError,
  ValidationError,
} from "./errors";

export interface Controller {
  handle(): RequestHandler;
}

interface ControllerOptions<TResult> {
  /** Runs the endpoint logic. Throw an AppError for business failures. */
  execute: (req: CustomRequest, res: Response) => Promise<TResult>;
  successMessage: string | ((result: TResult) => string);
  successStatus?: number;
  /** Maps the execute result to the response payload (defaults to identity). */
  mapResult?: (result: TResult) => unknown;
}

/**
 * Builds a controller exposing the same `handle()` interface as the legacy
 * controller classes. Success responses go through APIResponse; every error
 * is forwarded to the central error handler middleware.
 */
export const createController = <TResult>(
  options: ControllerOptions<TResult>
): Controller => ({
  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const result = await options.execute(req, res);
        const message =
          typeof options.successMessage === "function"
            ? options.successMessage(result)
            : options.successMessage;
        const payload = options.mapResult
          ? options.mapResult(result)
          : (result as unknown);
        APIResponse(res, payload ?? null, message, options.successStatus ?? 200);
      } catch (error) {
        next(error);
      }
    };
  },
});

/** Returns the decoded token or throws a 401 if the request is unauthenticated. */
export const requireAuth = (req: CustomRequest): IDecodedToken => {
  if (!req.decoded?.id) {
    throw new UnauthorizedError();
  }
  return req.decoded;
};

/** Validates data against a Zod schema, throwing a 400 ValidationError on failure. */
export const validateOrThrow = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  const errors = validateData(schema, data);
  if (errors) {
    throw new ValidationError(errors);
  }
  return schema.parse(data);
};

/** Returns a route param validated as a MongoDB ObjectId, or throws a 400. */
export const requireObjectIdParam = (
  req: CustomRequest,
  name: string
): string => {
  const value = getParam(req.params, name);
  if (!value || !isValidObjectId(value)) {
    throw new AppError(
      ERROR_CODES.INVALID_ROUTE_PARAM,
      400,
      `Paramètre '${name}' invalide`,
      { param: name }
    );
  }
  return value;
};
