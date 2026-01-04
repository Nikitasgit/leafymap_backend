import { Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, IDecodedToken } from "../types/custom";
import { IUserRepository } from "../repositories/users/IUserRepository";

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
          res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
          });
          return;
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token, JWT_SECRET) as IDecodedToken;

        if (!decoded) {
          res.status(401).json({
            success: false,
            message: "Invalid token",
          });
          return;
        }

        const user = await this.userRepository.findById(decoded.id, ["_id"]);

        if (!user) {
          res.status(401).json({
            success: false,
            message: "User not found",
          });
          return;
        }

        req.decoded = decoded;

        next();
      } catch (error) {
        res.status(401).json({
          success: false,
          message: "Not authorized to access this route",
        });
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
            ]);
            if (user) {
              req.decoded = decoded;
            }
          }
        } catch (error) {}

        next();
      } catch (error) {
        next();
      }
    };
  }
}

export default AuthMiddleware;
