import { Request, Response, NextFunction } from "express";
import {
  AppError,
  ConflictError,
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@src/shared/errors";
import { APIResponse } from "@src/api/http/response";
import logger from "@src/shared/logger";

const httpStatusFor = (err: AppError): number => {
  if (err instanceof ValidationError) return 400;
  if (err instanceof UnauthorizedError) return 401;
  if (err instanceof ForbiddenError) return 403;
  if (err instanceof NotFoundError) return 404;
  if (err instanceof ConflictError) return 409;
  return 500;
};

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    const statusCode = httpStatusFor(err);
    if (statusCode >= 500) {
      logger.error(
        `${req.method} ${req.originalUrl} - ${statusCode} ${err.code} ${err.message}`,
        err
      );
    } else {
      logger.warn(
        `${req.method} ${req.originalUrl} - ${statusCode} ${err.code} ${err.message}`
      );
    }
    APIResponse(res, err.data, err.message, statusCode, err.code);
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  const message = err instanceof Error ? err.message : "Erreur serveur";
  APIResponse(res, null, message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
};

export default errorHandler;
