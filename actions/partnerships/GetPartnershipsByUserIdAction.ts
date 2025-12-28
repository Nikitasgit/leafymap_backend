import {
  IPartnershipRepository,
  PartnershipFilters,
} from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";
import { IEvent, IPlace } from "../../types/models";
import { getEventStatusFromSchedule } from "../../utils/eventDates";

export interface GetPartnershipsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
  onlyAccepted?: boolean;
}

export interface IGetPartnershipsByUserIdAction {
  execute(params: {
    filters: GetPartnershipsByUserIdInput;
  }): Promise<IPartnership[]>;
}

class GetPartnershipsByUserIdAction implements IGetPartnershipsByUserIdAction {
  private readonly project: (keyof IPartnership | string)[] = [
    "_id",
    "type",
    "place",
    "event",
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "updatedAt",
    "initiator._id",
    "initiator.firstName",
    "initiator.lastName",
    "initiator.email",
    "collaborator._id",
    "collaborator.firstName",
    "collaborator.lastName",
    "collaborator.email",
    "place._id",
    "place.name",
    "place.address",
    "place.image",
    "place.location",
    "place.active",
    "place.deleted",
    "place.description",
    "place.image.urls",
    "event._id",
    "event.name",
    "event.description",
    "event.image",
    "event.schedule",
    "event.status",
    "event.image.urls",
  ];

  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    filters,
  }: {
    filters: GetPartnershipsByUserIdInput;
  }): Promise<IPartnership[]> {
    const queryFilters: PartnershipFilters = {
      deleted: false,
    };

    if (filters.asCollaborator) {
      queryFilters.collaborator = filters.userId;
    } else {
      queryFilters.initiator = filters.userId;
    }

    if (filters.onlyAccepted) {
      queryFilters.status = "accepted";
    }

    const partnerships = await this.partnershipRepository.findAll({
      filters: queryFilters,
      project: this.project,
      sort: { updatedAt: -1 },
    });

    // Filter out partnerships with deleted/ inactive places
    let validPartnerships = partnerships.filter((partnership: any) => {
      const place = partnership.place as Partial<IPlace> | null;
      if (!place || place.deleted || !place.active) {
        return false;
      }
      if (partnership.type === "event" && !partnership.event) {
        return false;
      }
      return true;
    });

    // Filter out cancelled events if needed
    if (filters.includeCancelledEvents !== true) {
      validPartnerships = validPartnerships.filter((partnership: any) => {
        if (!partnership.event) {
          return true;
        }
        const event = partnership.event as Partial<IEvent>;
        return event.status !== "cancelled";
      });
    }

    // Filter out past events if needed
    if (filters.includePastEvents !== true) {
      validPartnerships = validPartnerships.filter((partnership: any) => {
        if (!partnership.event) {
          return true;
        }
        const event = partnership.event as IEvent;
        if (!event.schedule) {
          return true;
        }
        const eventStatusResult = getEventStatusFromSchedule(event.schedule);
        return (
          eventStatusResult === "ongoing" || eventStatusResult === "upcoming"
        );
      });
    }

    return validPartnerships as IPartnership[];
  }
}

export default GetPartnershipsByUserIdAction;
