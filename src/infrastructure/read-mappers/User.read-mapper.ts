import {
  UserDetailsReadModel,
  UserListItemReadModel,
} from "@src/domain/read-models/user.read-models";
import { normalizeLeanDocument } from "@src/infrastructure/persistence/utils/normalizeLeanDocument";

/**
 * Hybrid read mapper: normalizeLeanDocument handles `_id` → `id` and ObjectId → string,
 * then we reshape the result into the typed read model expected by the API.
 */
export class UserReadMapper {
  static toListItem(doc: unknown): UserListItemReadModel {
    return normalizeLeanDocument<UserListItemReadModel>(doc);
  }

  static toListItems(docs: unknown[]): UserListItemReadModel[] {
    return docs.map((doc) => UserReadMapper.toListItem(doc));
  }

  static toDetail(doc: unknown): UserDetailsReadModel {
    return normalizeLeanDocument<UserDetailsReadModel>(doc);
  }

  static toDetails(docs: unknown[]): UserDetailsReadModel[] {
    return docs.map((doc) => UserReadMapper.toDetail(doc));
  }
}
