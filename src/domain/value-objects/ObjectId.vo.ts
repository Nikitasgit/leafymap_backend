export type FavoriteId = string & { readonly __brand: "FavoriteId" };
export type UserId = string & { readonly __brand: "UserId" };
export type ReferenceId = string & { readonly __brand: "ReferenceId" };
export type FollowId = string & { readonly __brand: "FollowId" };
export type CommentId = string & { readonly __brand: "CommentId" };
export type ReviewId = string & { readonly __brand: "ReviewId" };
export type EventId = string & { readonly __brand: "EventId" };
export type EventBookingId = string & { readonly __brand: "EventBookingId" };
export type PlaceId = string & { readonly __brand: "PlaceId" };
export type EventCategoryId = string & { readonly __brand: "EventCategoryId" };
export type ImageId = string & { readonly __brand: "ImageId" };

export const FavoriteId = {
  from(value: string): FavoriteId {
    return value as FavoriteId;
  },
};

export const UserId = {
  from(value: string): UserId {
    return value as UserId;
  },
};

export const ReferenceId = {
  from(value: string): ReferenceId {
    return value as ReferenceId;
  },
};

export const FollowId = {
  from(value: string): FollowId {
    return value as FollowId;
  },
};

export const CommentId = {
  from(value: string): CommentId {
    return value as CommentId;
  },
};

export const ReviewId = {
  from(value: string): ReviewId {
    return value as ReviewId;
  },
};

export const EventId = {
  from(value: string): EventId {
    return value as EventId;
  },
};

export const EventBookingId = {
  from(value: string): EventBookingId {
    return value as EventBookingId;
  },
};

export const PlaceId = {
  from(value: string): PlaceId {
    return value as PlaceId;
  },
};

export const EventCategoryId = {
  from(value: string): EventCategoryId {
    return value as EventCategoryId;
  },
};

export const ImageId = {
  from(value: string): ImageId {
    return value as ImageId;
  },
};
