import { IPartnershipRepository } from "@/types/repositories/partnership.repository.types";
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
    return this.partnershipRepository.findAllForUser({
      filters,
      project: this.project,
      sort: { updatedAt: -1 },
    });
  }
}

export default GetPartnershipsByUserIdAction;
