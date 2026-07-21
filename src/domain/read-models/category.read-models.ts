/**
 * Typed read models for category query paths (category types, user/place/
 * product/event categories). Produced by infrastructure Read Mappers
 * (never raw Mongo docs).
 */

export interface CategoryItemReadModel {
  id: string;
  name?: string;
  type?: { id: string; name?: string } | string;
  types?: Array<{ id: string; name?: string } | string>;
  [key: string]: unknown;
}
