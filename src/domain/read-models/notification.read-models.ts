/**
 * Typed read models for Notification query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";

export interface NotificationSenderReadModel {
  id: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  image?: {
    urls?: {
      original?: string;
      thumbnail?: string;
      medium?: string;
    };
  };
  googlePictureUrl?: string;
}

export interface NotificationListItem {
  id: string;
  action: NotificationAction;
  reference: string;
  referenceType: NotificationReferenceType;
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: NotificationSenderReadModel;
}
