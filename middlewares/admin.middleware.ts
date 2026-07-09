import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { isBanActive } from "@/utils/ban";
import { ERROR_CODES, ForbiddenError, UnauthorizedError } from "@/utils/errors";

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

      const user = await this.userRepository.findById(decoded.id, [
        "_id",
        "role",
        "deleted",
        "bannedAt",
        "banExpiresAt",
      ]);

      if (!user || user.role !== "admin" || user.deleted || isBanActive(user)) {
        next(new ForbiddenError(ERROR_CODES.FORBIDDEN, "Forbidden"));
        return;
      }

      next();
    };
  }
}

export default AdminMiddleware;
