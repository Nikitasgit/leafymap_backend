import { asClass, AwilixContainer } from "awilix";
import PartnershipsController from "@src/api/controllers/PartnershipsController";
import CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import PartnershipNotifierAdapter from "@src/infrastructure/adapters/PartnershipNotifier.adapter";
import type { Cradle } from "@src/di/cradle";

export const registerPartnershipsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    partnershipNotifier: asClass(PartnershipNotifierAdapter).singleton(),
    createPartnershipUseCase: asClass(CreatePartnershipUseCase).singleton(),
    updatePartnershipsUseCase: asClass(UpdatePartnershipsUseCase).singleton(),
    deletePartnershipUseCase: asClass(DeletePartnershipUseCase).singleton(),
    getPartnershipsByUserIdUseCase: asClass(
      GetPartnershipsByUserIdUseCase
    ).singleton(),

    partnershipsController: asClass(PartnershipsController).singleton(),
  });
};
