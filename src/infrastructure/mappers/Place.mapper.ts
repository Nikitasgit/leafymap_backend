import { Place } from "@src/domain/entities/Place.entity";
import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import {
  PlaceCustomDate,
  PlaceDefaultSchedule,
} from "@src/domain/value-objects/PlaceSchedule.vo";
import { PlaceDocumentProps } from "@src/infrastructure/persistence/schemas/Place.schema";
import { Types } from "mongoose";

type PlaceDocumentWithId = PlaceDocumentProps & { _id: Types.ObjectId };

export class PlaceMapper {
  static toDomain(doc: PlaceDocumentWithId): Place {
    return Place.reconstitute({
      id: PlaceId.from(doc._id.toString()),
      userId: UserId.from(doc.user.toString()),
      location: PlaceLocation.from({
        type: doc.location.type,
        coordinates: [
          doc.location.coordinates[0],
          doc.location.coordinates[1],
        ],
        label: doc.location.label,
        id: doc.location.id,
      }),
      placeCategoryId: PlaceCategoryId.from(doc.placeCategory.toString()),
      defaultSchedule: (doc.defaultSchedule ?? {}) as PlaceDefaultSchedule,
      customDates: (doc.customDates ?? []) as PlaceCustomDate[],
      rating: doc.rating ?? 0,
      deleted: doc.deleted ?? false,
      deletedAt: doc.deletedAt,
      deletedBy: doc.deletedBy
        ? UserId.from(doc.deletedBy.toString())
        : undefined,
      deleteReason: doc.deleteReason,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    place: Place
  ): Omit<PlaceDocumentProps, "_id" | "createdAt" | "updatedAt"> {
    return {
      user: new Types.ObjectId(place.userId),
      location: {
        type: place.location.type,
        coordinates: place.location.coordinates,
        label: place.location.label,
        id: place.location.id,
      },
      placeCategory: new Types.ObjectId(place.placeCategoryId),
      defaultSchedule: place.defaultSchedule,
      customDates: place.customDates,
      rating: place.rating,
      deleted: place.deleted,
      deletedAt: place.deletedAt,
      deletedBy: place.deletedBy
        ? new Types.ObjectId(place.deletedBy)
        : undefined,
      deleteReason: place.deleteReason,
    };
  }
}
