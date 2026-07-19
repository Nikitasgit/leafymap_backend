import { Response, NextFunction, RequestHandler } from "express";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { CustomRequest } from "@src/api/types/custom";
import { ERROR_CODES, ForbiddenError, UnauthorizedError } from "@src/shared/errors";

class AdminMiddleware {
  constructor(private userRepository: IUserRepository) {}

  requireAdmin(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      const decoded = req.decoded;
      if (!decoded?.id) {
        next(new UnauthorizedError(ERROR_CODES.UNAUTHORIZED, "Unauthorized"));
        return;
      }

      const user = await this.userRepository.findById(UserId.from(decoded.id));

      if (
        !user ||
        user.role !== "admin" ||
        user.deleted ||
        user.isBanActive()
      ) {
        next(new ForbiddenError(ERROR_CODES.FORBIDDEN, "Forbidden"));
        return;
      }

      next();
    };
  }
}

export default AdminMiddleware;
