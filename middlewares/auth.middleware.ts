import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, IDecodedToken } from "@/types/custom";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { isBanActive } from "@/utils/ban";
import { ERROR_CODES, UnauthorizedError } from "@/utils/errors";

class AuthMiddleware {
  constructor(private userRepository: IUserRepository) {}

  verify(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const token =
          req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
          next(
            new UnauthorizedError(
              ERROR_CODES.UNAUTHORIZED,
              "Not authorized to access this route"
            )
          );
          return;
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as IDecodedToken;

        if (!decoded) {
          next(new UnauthorizedError(ERROR_CODES.UNAUTHORIZED, "Invalid token"));
          return;
        }

        const user = await this.userRepository.findById(decoded.id, [
          "_id",
          "deleted",
          "bannedAt",
          "banExpiresAt",
        ]);

        if (!user || user.deleted || isBanActive(user)) {
          next(new UnauthorizedError(ERROR_CODES.USER_NOT_FOUND, "User not found"));
          return;
        }

        req.decoded = decoded;

        next();
      } catch {
        next(
          new UnauthorizedError(
            ERROR_CODES.UNAUTHORIZED,
            "Not authorized to access this route"
          )
        );
      }
    };
  }

  verifyOptional(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const token =
          req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
          next();
          return;
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          next();
          return;
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET) as IDecodedToken;

          if (decoded) {
            const user = await this.userRepository.findById(decoded.id, [
              "_id",
              "deleted",
              "bannedAt",
              "banExpiresAt",
            ]);
            if (user && !user.deleted && !isBanActive(user)) {
              req.decoded = decoded;
            }
          }
        } catch {
          // Invalid token — continue without authentication
        }

        next();
      } catch {
        next();
      }
    };
  }
}

export default AuthMiddleware;
