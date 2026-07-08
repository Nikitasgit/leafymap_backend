import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import { isBanActive } from "@/utils/ban";

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
        res.status(401).json({ success: false, message: "Unauthorized" });
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
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      next();
    };
  }
}

export default AdminMiddleware;
