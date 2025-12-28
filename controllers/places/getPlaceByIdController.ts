import { Response, NextFunction, RequestHandler } from "express";
import { Request } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetPlaceByIdAction } from "../../actions/places/GetPlaceByIdAction";

class GetPlaceByIdController {
  constructor(private getPlaceByIdAction: IGetPlaceByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { placeId } = req.params;

        const place = await this.getPlaceByIdAction.execute({ placeId });

        APIResponse(res, place, "Place fetched successfully", 200);
      } catch (error) {
        logger.error("Error fetching place:", error);
        const message = error instanceof Error ? error.message : "Server error";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetPlaceByIdController;
