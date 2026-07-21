export function assertPersistedId<T>(
  entityName: string,
  id: T | null | undefined
): T {
  if (!id) {
    throw new Error(`Cannot update ${entityName} without id`);
  }
  return id;
}
