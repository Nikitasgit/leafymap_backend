import { Types } from "mongoose";
import { ICommentRepository } from "@/types/repositories/comment.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { IImageRepository } from "@/types/repositories/image.repository.types";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IReviewRepository } from "@/types/repositories/review.repository.types";

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

    const repo = this.getRepository(params.resource);
    const item = await repo.findById(params.resourceId, ["_id"]);
    if (!item) {
      throw new Error("Resource not found");
    }

    await repo.updateOne(params.resourceId, update as never);
  }

  private getRepository(resource: AdminResource) {
    const repositories = {
      events: this.eventRepository,
      places: this.placeRepository,
      images: this.imageRepository,
      reviews: this.reviewRepository,
      comments: this.commentRepository,
    };

    return repositories[resource];
  }
}

export default SoftDeleteAdminResourceAction;
