/**
 * Typed read models for Image query paths.
 * Produced by infrastructure Read Mappers (never raw Mongo docs).
 */

/** Summary view returned by findAdminSummariesByUserId. */
export interface ImageAdminSummaryReadModel {
  id: string;
  type?: string;
  referenceType?: string;
  deleted?: boolean;
  createdAt?: string | Date;
  [key: string]: unknown;
}
