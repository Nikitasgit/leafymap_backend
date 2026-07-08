import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetUserByIdAction } from "@/actions/users";
import { IUser } from "@/types/models/user";

class GetCurrentUserController {
  private readonly project: (keyof IUser | string)[] = [
    "_id",
    "email",
    "username",
    "firstname",
    "lastname",
    "userType",
    "role",
    "acceptedCGU",
    "website",
    "phone",
    "description",
    "country",
    "address",
    "followers",
    "place",
    "image.urls",
    "googlePictureUrl",
    "place.location",
    "place.placeCategory",
    "place.rating",
    "userCategory",
    "userCategory.name",
    "bannedAt",
    "banReason",
    "banDuration",
    "banExpiresAt",
    "lastLogin",
    "preferences",
  ];

  constructor(private getUserByIdAction: IGetUserByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;
        const user = await this.getUserByIdAction.execute({
          userId: decoded.id,
          project: this.project,
        });

        APIResponse(res, { user }, "User retrieved successfully", 200);
      } catch (error) {
        logger.error("Error in getCurrentUser:", error);
        APIResponse(res, null, "Server error", 500);
      }
    };
  }
}

export default GetCurrentUserController;
