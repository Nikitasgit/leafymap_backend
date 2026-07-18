import { Types } from "mongoose";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import {
  CommentId,
  EventId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { ERROR_CODES, NotFoundError } from "@/utils/errors";

export type AdminResource =
  | "events"
  | "places"
  | "images"
  | "reviews"
  | "comments";

export interface ISoftDeleteAdminResourceAction {
  execute(params: {
    adminId: string;
    resource: AdminResource;
    resourceId: string;
    deleted: boolean;
    reason?: string;
  }): Promise<void>;
}

class SoftDeleteAdminResourceAction implements ISoftDeleteAdminResourceAction {
  constructor(
    private eventRepository: IEventRepository,
    private placeRepository: IPlaceRepository,
    private imageRepository: IImageRepository,
    private reviewRepository: IReviewRepository,
    private commentRepository: ICommentRepository
  ) {}

  async execute(params: {
    adminId: string;
    resource: AdminResource;
    resourceId: string;
    deleted: boolean;
    reason?: string;
  }): Promise<void> {
    if (params.resource === "comments") {
      const commentId = CommentId.from(params.resourceId);
      const comment = await this.commentRepository.findById(commentId);
      if (!comment) {
        throw new NotFoundError(
          ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
          "Resource not found"
        );
      }

      await this.commentRepository.softDelete(commentId, {
        deleted: params.deleted,
        adminId: UserId.from(params.adminId),
        reason: params.reason,
      });
      return;
    }

    if (params.resource === "reviews") {
      const reviewId = ReviewId.from(params.resourceId);
      const review = await this.reviewRepository.findById(reviewId);
      if (!review) {
        throw new NotFoundError(
          ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
          "Resource not found"
        );
      }

      await this.reviewRepository.softDelete(reviewId, {
        deleted: params.deleted,
        adminId: UserId.from(params.adminId),
        reason: params.reason,
      });
      return;
    }

    if (params.resource === "events") {
      const eventId = EventId.from(params.resourceId);
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        throw new NotFoundError(
          ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
          "Resource not found"
        );
      }

      await this.eventRepository.softDelete(eventId, {
        deleted: params.deleted,
        adminId: UserId.from(params.adminId),
        reason: params.reason,
      });
      return;
    }

    const update = params.deleted
      ? {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: new Types.ObjectId(params.adminId),
          deleteReason: params.reason,
        }
      : {
          deleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
          deleteReason: undefined,
        };

    const repo =
      params.resource === "places"
        ? this.placeRepository
        : this.imageRepository;
    const item = await repo.findById(params.resourceId, ["_id"]);
    if (!item) {
      throw new NotFoundError(
        ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
        "Resource not found"
      );
    }

    await repo.updateOne(params.resourceId, update as never);
  }
}

export default SoftDeleteAdminResourceAction;
