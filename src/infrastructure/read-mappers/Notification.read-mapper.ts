import {
  NotificationListItemReadModel,
  NotificationSenderReadModel,
} from "@src/domain/read-models/notification.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

type NormalizedSender = string | (Record<string, unknown> & { id: string });

interface NormalizedNotificationDoc {
  id: string;
  action: NotificationListItemReadModel["action"];
  reference: string;
  referenceType: NotificationListItemReadModel["referenceType"];
  read?: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  sender?: NormalizedSender;
}

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the populated sender subdocument into the typed read model
 * expected by the API.
 */
export class NotificationReadMapper {
  static toListItem(doc: unknown): NotificationListItemReadModel {
    const normalized = normalizeLeanDocument<NormalizedNotificationDoc>(doc);

    return {
      id: normalized.id,
      action: normalized.action,
      reference: normalized.reference,
      referenceType: normalized.referenceType,
      read: normalized.read,
      readAt: normalized.readAt,
      createdAt: normalized.createdAt,
      updatedAt: normalized.updatedAt,
      sender: NotificationReadMapper.mapSender(normalized.sender),
    };
  }

  static toListItems(docs: unknown[]): NotificationListItemReadModel[] {
    return docs.map((doc) => NotificationReadMapper.toListItem(doc));
  }

  private static mapSender(
    sender: NormalizedSender | undefined
  ): NotificationSenderReadModel | undefined {
    if (!sender || typeof sender === "string") {
      return undefined;
    }

    return {
      id: sender.id,
      username: sender.username as string | undefined,
      firstname: sender.firstname as string | undefined,
      lastname: sender.lastname as string | undefined,
      image: sender.image as NotificationSenderReadModel["image"],
      googlePictureUrl: sender.googlePictureUrl as string | undefined,
    };
  }
}
