import { Response, NextFunction, RequestHandler } from "express";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { CustomRequest } from "@src/api/types/custom";
import {
  AppError,
  ERROR_CODES,
  UnauthorizedError,
} from "@src/shared/errors";

class AuthMiddleware {
  constructor(
    private readonly jwtTokenIssuer: IJwtTokenIssuer,
    private readonly userRepository: IUserRepository
  ) {}

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

        const decoded = this.jwtTokenIssuer.verify(token);

        const user = await this.userRepository.findById(
          UserId.from(decoded.id)
        );

        if (!user) {
          next(
            new UnauthorizedError(ERROR_CODES.USER_NOT_FOUND, "User not found")
          );
          return;
        }

        user.assertCanAuthenticate();

        req.decoded = decoded;

        next();
      } catch (error) {
        if (error instanceof AppError) {
          next(error);
          return;
        }
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

        try {
          const decoded = this.jwtTokenIssuer.verify(token);
          const user = await this.userRepository.findById(
            UserId.from(decoded.id)
          );
          if (user) {
            user.assertCanAuthenticate();
            req.decoded = decoded;
          }
        } catch {
          // Invalid token or inaccessible user — continue without authentication
        }

        next();
      } catch {
        next();
      }
    };
  }
}

export default AuthMiddleware;
