export interface GetEventsInViewInput {
  ne: number[];
  sw: number[];
  eventCategories?: string[];
  startDate?: string | null;
  endDate?: string | null;
  limit?: number;
}
