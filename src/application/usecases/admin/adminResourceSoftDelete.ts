import { AdminResource } from "@src/application/dtos/admin/softDeleteAdminResource.dto";
import { ICommentRepository } from "@src/domain/interfaces/ICommentRepository";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IImageRepository } from "@src/domain/interfaces/IImageRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import {
  CommentId,
  EventId,
  ImageId,
  PlaceId,
  ReviewId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

export interface AdminResourceRepositories {
  eventRepository: IEventRepository;
  placeRepository: IPlaceRepository;
  imageRepository: IImageRepository;
  reviewRepository: IReviewRepository;
  commentRepository: ICommentRepository;
}

export async function applyAdminResourceSoftDelete(
  repos: AdminResourceRepositories,
  params: {
    adminId: string;
    resource: AdminResource;
    resourceId: string;
    deleted: boolean;
    reason?: string;
  }
): Promise<void> {
  if (params.resource === "comments") {
    const commentId = CommentId.from(params.resourceId);
    const comment = await repos.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError(
        ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
        "Resource not found"
      );
    }

    await repos.commentRepository.softDelete(commentId, {
      deleted: params.deleted,
      adminId: UserId.from(params.adminId),
      reason: params.reason,
    });
    return;
  }

  if (params.resource === "reviews") {
    const reviewId = ReviewId.from(params.resourceId);
    const review = await repos.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundError(
        ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
        "Resource not found"
      );
    }

    await repos.reviewRepository.softDelete(reviewId, {
      deleted: params.deleted,
      adminId: UserId.from(params.adminId),
      reason: params.reason,
    });
    return;
  }

  if (params.resource === "events") {
    const eventId = EventId.from(params.resourceId);
    const event = await repos.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError(
        ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
        "Resource not found"
      );
    }

    await repos.eventRepository.softDelete(eventId, {
      deleted: params.deleted,
      adminId: UserId.from(params.adminId),
      reason: params.reason,
    });
    return;
  }

  if (params.resource === "images") {
    const imageId = ImageId.from(params.resourceId);
    const image = await repos.imageRepository.findById(imageId);
    if (!image) {
      throw new NotFoundError(
        ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
        "Resource not found"
      );
    }

    await repos.imageRepository.softDelete(imageId, {
      deleted: params.deleted,
      deletedAt: params.deleted ? new Date() : undefined,
      deletedBy: params.deleted ? UserId.from(params.adminId) : undefined,
      deleteReason: params.deleted ? params.reason : undefined,
    });
    return;
  }

  const placeId = PlaceId.from(params.resourceId);
  const place = await repos.placeRepository.findById(placeId);
  if (!place) {
    throw new NotFoundError(
      ERROR_CODES.ADMIN_RESOURCE_NOT_FOUND,
      "Resource not found"
    );
  }

  await repos.placeRepository.softDelete(placeId, {
    deleted: params.deleted,
    deletedAt: params.deleted ? new Date() : undefined,
    deletedBy: params.deleted ? UserId.from(params.adminId) : undefined,
    deleteReason: params.deleted ? params.reason : undefined,
  });
}
