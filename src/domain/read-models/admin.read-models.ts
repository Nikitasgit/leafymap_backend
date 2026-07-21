import { AdminCommentSummaryReadModel } from "@src/domain/read-models/comment.read-models";
import { AdminEventSummaryReadModel } from "@src/domain/read-models/event.read-models";
import { ImageAdminSummaryReadModel } from "@src/domain/read-models/image.read-models";
import { PlaceListItemReadModel } from "@src/domain/read-models/place.read-models";
import { AdminReviewSummaryReadModel } from "@src/domain/read-models/review.read-models";

export interface AdminUserContentReadModel {
  events: AdminEventSummaryReadModel[];
  places: PlaceListItemReadModel[];
  images: ImageAdminSummaryReadModel[];
  reviews: AdminReviewSummaryReadModel[];
  comments: AdminCommentSummaryReadModel[];
}
