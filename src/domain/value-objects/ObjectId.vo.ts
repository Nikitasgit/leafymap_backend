type Branded<Brand extends string> = string & { readonly __brand: Brand };

const brandedId = <Id extends string>() => ({
  from(value: string): Id {
    return value as Id;
  },
});

export type FavoriteId = Branded<"FavoriteId">;
export type UserId = Branded<"UserId">;
export type ReferenceId = Branded<"ReferenceId">;
export type FollowId = Branded<"FollowId">;
export type CommentId = Branded<"CommentId">;
export type ReviewId = Branded<"ReviewId">;
export type EventId = Branded<"EventId">;
export type EventBookingId = Branded<"EventBookingId">;
export type EventInvitationId = Branded<"EventInvitationId">;
export type PartnershipId = Branded<"PartnershipId">;
export type PlaceId = Branded<"PlaceId">;
export type EventCategoryId = Branded<"EventCategoryId">;
export type ImageId = Branded<"ImageId">;
export type ProductId = Branded<"ProductId">;
export type ProductCategoryId = Branded<"ProductCategoryId">;
export type PlaceCategoryId = Branded<"PlaceCategoryId">;
export type UserCategoryId = Branded<"UserCategoryId">;
export type NotificationId = Branded<"NotificationId">;
export type MessageId = Branded<"MessageId">;
export type ConversationId = Branded<"ConversationId">;

export const FavoriteId = brandedId<FavoriteId>();
export const UserId = brandedId<UserId>();
export const ReferenceId = brandedId<ReferenceId>();
export const FollowId = brandedId<FollowId>();
export const CommentId = brandedId<CommentId>();
export const ReviewId = brandedId<ReviewId>();
export const EventId = brandedId<EventId>();
export const EventBookingId = brandedId<EventBookingId>();
export const EventInvitationId = brandedId<EventInvitationId>();
export const PartnershipId = brandedId<PartnershipId>();
export const PlaceId = brandedId<PlaceId>();
export const EventCategoryId = brandedId<EventCategoryId>();
export const ImageId = brandedId<ImageId>();
export const ProductId = brandedId<ProductId>();
export const ProductCategoryId = brandedId<ProductCategoryId>();
export const PlaceCategoryId = brandedId<PlaceCategoryId>();
export const UserCategoryId = brandedId<UserCategoryId>();
export const NotificationId = brandedId<NotificationId>();
export const MessageId = brandedId<MessageId>();
export const ConversationId = brandedId<ConversationId>();
