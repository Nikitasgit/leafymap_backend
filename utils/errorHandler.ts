import { Request, Response, NextFunction } from "express";
import { AppError, ERROR_CODES } from "./errors";
import { APIResponse } from "./response";
import logger from "./logger";

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
    if (err.statusCode >= 500) {
      logger.error(
        `${req.method} ${req.originalUrl} - ${err.statusCode} ${err.code} ${err.message}`,
        err
      );
    } else {
      logger.warn(
        `${req.method} ${req.originalUrl} - ${err.statusCode} ${err.code} ${err.message}`
      );
    }
    APIResponse(res, err.data, err.message, err.statusCode, err.code);
    return;
  }

  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);
  const message = err instanceof Error ? err.message : "Erreur serveur";
  APIResponse(res, null, message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
};

export default errorHandler;
