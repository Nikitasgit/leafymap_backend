import {
  PlaceDetailsReadModel,
  PlaceListItemReadModel,
} from "@src/domain/read-models/place.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

export class PlaceReadMapper {
  static toListItem(doc: unknown): PlaceListItemReadModel {
    return PlaceReadMapper.map(doc);
  }

  static toListItems(docs: unknown[]): PlaceListItemReadModel[] {
    return docs.map((doc) => PlaceReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): PlaceDetailsReadModel {
    return PlaceReadMapper.map(doc);
  }

  static toDetails(docs: unknown[]): PlaceDetailsReadModel[] {
    return docs.map((doc) => PlaceReadMapper.toDetail(doc));
  }

  private static map(doc: unknown): PlaceDetailsReadModel {
    const place = normalizeLeanDocument<PlaceDetailsReadModel>(doc);
    return {
      id: place.id,
      location: place.location,
      rating: place.rating,
      placeCategory: place.placeCategory,
      user: place.user,
      defaultSchedule: place.defaultSchedule,
      customDates: place.customDates,
      deleted: place.deleted,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt,
    };
  }
}
