import { EventListFilters } from "@src/domain/interfaces/IEventRepository";

export interface GetEventsInput {
  filters?: EventListFilters;
}
