import { Response, NextFunction, RequestHandler } from "express";
import { isValidObjectId } from "@src/api/http/objectId";
import { z } from "zod";
import { CustomRequest, IDecodedToken } from "@src/api/types/custom";
import { APIResponse } from "./response";
import { signResponseImageUrls } from "./imageUrlSigning";
import { getParam } from "./request";
import {
  ERROR_CODES,
  UnauthorizedError,
  ValidationError,
} from "@src/shared/errors";

export interface Controller {
  handle(): RequestHandler;
}

export interface ControllerOptions<TResult> {
  /** Runs the endpoint logic. Throw an AppError for business failures. */
  execute: (req: CustomRequest, res: Response) => Promise<TResult>;
  successMessage: string | ((result: TResult) => string);
  successStatus?: number;
  /** Maps the execute result to the response payload (defaults to identity). */
  mapResult?: (result: TResult) => unknown;
  /**
   * When false, skips automatic S3 URL signing on the response payload.
   * Defaults to true so populated image URLs stay accessible to clients.
   */
  signImages?: boolean;
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
        let payload = options.mapResult
          ? options.mapResult(result)
          : (result as unknown);

        if (options.signImages !== false) {
          payload = await signResponseImageUrls(payload);
        }

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

/** Validates data against a Zod schema, throwing a ValidationError on failure. */
export const validateOrThrow = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.reduce(
      (acc, issue) => {
        const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
        acc[key] = issue.message;
        return acc;
      },
      {} as Record<string, string>
    );
    throw new ValidationError(errors);
  }
  return result.data;
};

/** Returns a route param validated as a MongoDB ObjectId, or throws a ValidationError. */
export const requireObjectIdParam = (
  req: CustomRequest,
  name: string
): string => {
  const value = getParam(req.params, name);
  if (!value || !isValidObjectId(value)) {
    throw new ValidationError(
      { param: name },
      ERROR_CODES.INVALID_ROUTE_PARAM,
      `Paramètre '${name}' invalide`
    );
  }
  return value;
};
