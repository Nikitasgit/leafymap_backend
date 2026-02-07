import {
  IPartnershipRepository,
  PartnershipFilters,
} from "@/types/repositories/partnership.repository.types";
import { IPartnership } from "@/types/models/partnership";

export interface GetPartnershipsByUserIdInput {
  userId: string;
  asCollaborator?: boolean;
  asInitiator?: boolean;
  status?: "pending" | "accepted" | "refused" | "cancelled" | "completed";
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
    "initiator",
    "collaborator",
    "status",
    "deleted",
    "updatedAt",
    "initiator._id",
    "initiator.username",
    "initiator.image.urls",
    "initiator.userCategory.name",
    "collaborator._id",
    "collaborator.username",
    "collaborator.image.urls",
    "collaborator.userCategory.name",
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

    if (filters.asCollaborator === true) {
      queryFilters.collaborator = filters.userId;
    } else if (filters.asInitiator === true) {
      queryFilters.initiator = filters.userId;
    } else {
      // Pas de filtre : retourner toutes les partnerships (initiator OU collaborator)
      queryFilters.$or = [
        { initiator: filters.userId },
        { collaborator: filters.userId },
      ];
    }

    if (filters.status) {
      queryFilters.status = filters.status;
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

    return filteredPartnerships as IPartnership[];
  }
}

export default GetPartnershipsByUserIdAction;
