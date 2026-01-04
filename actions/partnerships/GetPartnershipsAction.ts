import {
  IPartnershipRepository,
  PartnershipFilters,
} from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";
import { IUser } from "../../types/models/user";

export interface GetPartnershipsInput {
  placeId: string;
  eventId?: string;
  type?: "place" | "event";
  currentUserId?: string;
  onlyAccepted?: boolean;
}

export interface IGetPartnershipsAction {
  execute(params: { filters: GetPartnershipsInput }): Promise<IPartnership[]>;
}

class GetPartnershipsAction implements IGetPartnershipsAction {
  private readonly project: (keyof IPartnership | string)[] = [
    "_id",
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "initiator._id",
    "collaborator._id",
    "collaborator.username",
    "collaborator.userCategories",
    "collaborator.image",
    "collaborator.deleted",
    "collaborator.image.urls",
    "collaborator.userCategories.name",
  ];

  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    filters,
  }: {
    filters: GetPartnershipsInput;
  }): Promise<IPartnership[]> {
    const queryFilters: PartnershipFilters = {
      place: filters.placeId,
      type: filters.type,
      deleted: false,
    };

    if (filters.eventId) {
      queryFilters.event = filters.eventId;
    }

    const partnerships = await this.partnershipRepository.findAll({
      filters: queryFilters,
      project: this.project,
    });

    const filteredPartnerships = partnerships.filter((partnership: any) => {
      if (!filters.currentUserId || filters.onlyAccepted) {
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

    const transformedPartnerships = filteredPartnerships
      .map((partnership: any) => {
        const collaborator = partnership.collaborator as Partial<IUser>;
        if (collaborator.deleted) {
          return null;
        }

        return {
          ...partnership,
          collaborator: {
            _id: collaborator._id,
            name: collaborator.username,
            categories: collaborator.userCategories,
            image: collaborator.image,
            deleted: collaborator.deleted,
          },
        };
      })
      .filter((p) => p !== null);

    return transformedPartnerships as IPartnership[];
  }
}

export default GetPartnershipsAction;
