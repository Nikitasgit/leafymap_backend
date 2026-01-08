import {
  IPartnershipRepository,
  PartnershipFilters,
} from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";
import { IEvent, IPlace } from "../../types/models";

export interface GetPartnershipsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  includeCancelledEvents?: boolean;
  includePastEvents?: boolean;
  currentUserId?: string;
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
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "updatedAt",
    "initiator._id",
    "initiator.firstName",
    "initiator.lastName",
    "initiator.email",
    "initiator.username",
    "initiator.image.urls",
    "collaborator._id",
    "collaborator.firstName",
    "collaborator.lastName",
    "collaborator.email",
    "place._id",
    "place.location",
    "place.placeCategory.name",
    "place.followers",
    "event._id",
    "event.name",
    "event.description",
    "event.image",
    "event.schedule",
    "event.status",
    "event.lifecycleStatus",
    "event.dateRange",
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

    const partnerships = await this.partnershipRepository.findAll({
      filters: queryFilters,
      project: this.project,
      sort: { updatedAt: -1 },
    });

    const filteredPartnerships = partnerships.filter((partnership: any) => {
      if (!filters.currentUserId) {
        return partnership.status === "accepted";
      }

      const isInitiator =
        partnership.initiator &&
        (typeof partnership.initiator === "object"
          ? partnership.initiator._id?.toString()
          : partnership.initiator.toString()) === filters.currentUserId;
      const isCollaborator =
        partnership.collaborator &&
        (typeof partnership.collaborator === "object"
          ? partnership.collaborator._id?.toString()
          : partnership.collaborator.toString()) === filters.currentUserId;

      if (isInitiator || isCollaborator) {
        return true;
      }

      return partnership.status === "accepted";
    });

    let validPartnerships = filteredPartnerships.filter((partnership: any) => {
      const place = partnership.place as Partial<IPlace> | null;
      if (!place) {
        return false;
      }
      if (partnership.type === "event" && !partnership.event) {
        return false;
      }
      return true;
    });

    if (filters.includeCancelledEvents !== true) {
      validPartnerships = validPartnerships.filter((partnership: any) => {
        if (!partnership.event) {
          return true;
        }
        const event = partnership.event as Partial<IEvent>;
        return event.status !== "cancelled";
      });
    }

    if (filters.includePastEvents !== true) {
      validPartnerships = validPartnerships.filter((partnership: any) => {
        if (!partnership.event) {
          return true;
        }
        const event = partnership.event as IEvent;
        if (!event.lifecycleStatus) {
          return true;
        }
        return (
          event.lifecycleStatus === "ongoing" ||
          event.lifecycleStatus === "upcoming"
        );
      });
    }

    return validPartnerships as IPartnership[];
  }
}

export default GetPartnershipsByUserIdAction;
