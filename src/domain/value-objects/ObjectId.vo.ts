export type FavoriteId = string & { readonly __brand: "FavoriteId" };
export type UserId = string & { readonly __brand: "UserId" };
export type ReferenceId = string & { readonly __brand: "ReferenceId" };
export type FollowId = string & { readonly __brand: "FollowId" };
export type CommentId = string & { readonly __brand: "CommentId" };
export type ReviewId = string & { readonly __brand: "ReviewId" };

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
