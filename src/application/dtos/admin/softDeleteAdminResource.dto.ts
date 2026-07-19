export type AdminResource =
  | "events"
  | "places"
  | "images"
  | "reviews"
  | "comments";

export interface SoftDeleteAdminResourceInput {
  adminId: string;
  resource: AdminResource;
  resourceId: string;
  reason?: string;
}

export interface RestoreAdminResourceInput {
  adminId: string;
  resource: AdminResource;
  resourceId: string;
  reason?: string;
}
