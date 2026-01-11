import {
  IPartnershipRepository,
  PartnershipFilters,
} from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";
import { IPlace } from "../../types/models";

export interface GetUserPlacesPartnershipsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  currentUserId?: string;
  onlyAccepted?: boolean;
}

export interface IGetUserPlacesPartnershipsByUserIdAction {
  execute(params: {
    filters: GetUserPlacesPartnershipsByUserIdInput;
  }): Promise<IPartnership[]>;
}

class GetUserPlacesPartnershipsByUserIdAction
  implements IGetUserPlacesPartnershipsByUserIdAction
{
  private readonly project: (keyof IPartnership | string)[] = [
    "_id",
    "type",
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "updatedAt",
    "initiator._id",
    "initiator.username",
    "initiator.image.urls",
    "collaborator._id",
    "collaborator.userCategories.name",
    "collaborator.username",
    "collaborator.image.urls",
    "place._id",
    "place.location",
    "place.placeCategory.name",
    "place.followers",
  ];

  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    filters,
  }: {
    filters: GetUserPlacesPartnershipsByUserIdInput;
  }): Promise<IPartnership[]> {
    const queryFilters: PartnershipFilters = {
      deleted: false,
      type: "place",
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
      if (filters.onlyAccepted) {
        return partnership.status === "accepted";
      }

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

    const validPartnerships = filteredPartnerships.filter(
      (partnership: any) => {
        const place = partnership.place as Partial<IPlace> | null;
        if (!place) {
          return false;
        }
        return true;
      }
    );

    return validPartnerships as IPartnership[];
  }
}

export default GetUserPlacesPartnershipsByUserIdAction;
