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
  onlyAccepted?: boolean;
}

export interface IGetPartnershipsAction {
  execute(params: { filters: GetPartnershipsInput }): Promise<IPartnership[]>;
}

class GetPartnershipsAction implements IGetPartnershipsAction {
  private readonly project: (keyof IPartnership | string)[] = [
    "_id",
    "collaborator",
    "status",
    "deleted",
    "collaborator._id",
    "collaborator.creatorName",
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

    if (filters.onlyAccepted) {
      queryFilters.status = "accepted";
    }

    const partnerships = await this.partnershipRepository.findAll({
      filters: queryFilters,
      project: this.project,
    });

    // Transform and filter partnerships
    const transformedPartnerships = partnerships
      .map((partnership: any) => {
        const collaborator = partnership.collaborator as Partial<IUser>;
        if (collaborator.deleted) {
          return null;
        }

        return {
          ...partnership,
          collaborator: {
            _id: collaborator._id,
            name: collaborator.creatorName,
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
