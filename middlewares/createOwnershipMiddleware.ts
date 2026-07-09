import { Response, NextFunction, RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";
import { toId } from "@/utils/mongoose";

export interface OwnershipMiddlewareOptions<TEntity> {
  paramName: string;
  findById: (id: string) => Promise<TEntity | null>;
  getOwnerId: (entity: TEntity) => string | null;
  reqKey?: keyof CustomRequest;
  paramReqKey?: keyof CustomRequest;
  notFoundMessage?: string;
  forbiddenMessage?: string;
  invalidIdMessage?: string;
  missingParamMessage?: string;
  validateObjectId?: boolean;
}

export function createOwnershipMiddleware<TEntity>({
  paramName,
  findById,
  getOwnerId,
  reqKey,
  paramReqKey,
  notFoundMessage = "Resource not found",
  forbiddenMessage = "You don't have permission to access this resource",
  invalidIdMessage = "Invalid ID",
  missingParamMessage,
  validateObjectId = false,
}: OwnershipMiddlewareOptions<TEntity>): RequestHandler {
  return async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const decoded = req.decoded!;
      const resourceId = getParam(req.params, paramName);

      if (!resourceId) {
        APIResponse(
          res,
          null,
          missingParamMessage ?? `${paramName} is required`,
          400
        );
        return;
      }

      if (validateObjectId && !isValidObjectId(resourceId)) {
        APIResponse(res, null, invalidIdMessage, 400);
        return;
      }

      const entity = await findById(resourceId);
      if (!entity) {
        APIResponse(res, null, notFoundMessage, 404);
        return;
      }

      const ownerId = getOwnerId(entity);
      if (!ownerId || ownerId !== decoded.id) {
        APIResponse(res, null, forbiddenMessage, 403);
        return;
      }

      if (reqKey) {
        (req as unknown as Record<string, unknown>)[reqKey as string] = entity;
      }

      if (paramReqKey) {
        (req as unknown as Record<string, unknown>)[paramReqKey as string] =
          resourceId;
      }

      next();
    } catch {
      APIResponse(res, null, "Failed to verify ownership", 500);
    }
  };
}

export function getEntityOwnerId(
  entity: { user?: unknown; author?: unknown }
): string | null {
  return toId(
    (entity.author ?? entity.user) as Parameters<typeof toId>[0]
  );
}
