import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { ERROR_CODES } from "@src/shared/errors";

class RateLimiterMiddleware {
  /**
   * Rate limiter for authentication routes (login, register)
   * Prevents brute force attacks by limiting attempts
   * @returns Rate limit middleware (15 minutes, max 20 requests)
   */
  auth(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 20,
      message: {
        success: false,
        message:
          "Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.",
        code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
    });
  }

  /**
   * Prevents API abuse and DDoS attacks
   * @returns Rate limit middleware (15 minutes, max 1000 requests)
   */
  api(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000,
      message: {
        success: false,
        message: "Trop de requêtes. Veuillez réessayer plus tard.",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  /**
   * Strict rate limiter for sensitive operations (delete, etc.)
   * @returns Rate limit middleware (1 hour, max 5 requests)
   */
  strict(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // Limit each IP to 5 requests per hour
      message: {
        success: false,
        message: "Trop de tentatives. Veuillez réessayer dans 1 heure.",
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }
}

export default RateLimiterMiddleware;
