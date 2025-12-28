import { IPartnershipRepository } from "../../repositories/partnerships/IPartnershipRepository";
import { IPartnership } from "../../types/models/partnership";
import { PartnershipDTO } from "../../types/api/partnership.dto";
import { Types } from "mongoose";

export interface CreatePartnershipsDTO {
  partnerships: PartnershipDTO[];
}

export interface ICreatePartnershipsAction {
  execute(params: {
    partnerships: PartnershipDTO[];
    placeId: string;
    eventId?: string;
    initiatorId: string;
  }): Promise<IPartnership[]>;
}

class CreatePartnershipsAction implements ICreatePartnershipsAction {
  constructor(private partnershipRepository: IPartnershipRepository) {}

  async execute({
    partnerships,
    placeId,
    eventId,
    initiatorId,
  }: {
    partnerships: PartnershipDTO[];
    placeId: string;
    eventId?: string;
    initiatorId: string;
  }): Promise<IPartnership[]> {
    const createPromises = partnerships.map(
      async (partnership: PartnershipDTO) => {
        const existingPartnership = await this.partnershipRepository.findOne({
          place: new Types.ObjectId(placeId),
          event: eventId ? new Types.ObjectId(eventId) : undefined,
          collaborator: new Types.ObjectId(partnership.collaborator._id!),
        } as Partial<IPartnership>);

        if (existingPartnership) {
          return existingPartnership;
        }

        const partnershipId = await this.partnershipRepository.create({
          place: new Types.ObjectId(placeId),
          event: eventId ? new Types.ObjectId(eventId) : undefined,
          initiator: new Types.ObjectId(initiatorId),
          collaborator: new Types.ObjectId(partnership.collaborator._id!),
          type: eventId ? "event" : "place",
          status: "pending",
          deleted: false,
        } as Partial<IPartnership>);

        const newPartnership = await this.partnershipRepository.findById(
          partnershipId.toString()
        );

        if (!newPartnership) {
          throw new Error("Failed to create partnership");
        }

        return newPartnership;
      }
    );

    const createdPartnerships = await Promise.all(createPromises);
    return createdPartnerships;
  }
}

export default CreatePartnershipsAction;
