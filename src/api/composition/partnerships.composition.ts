import CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import CreatePartnershipController from "@src/api/controllers/partnerships/createPartnership.controller";
import UpdatePartnershipsController from "@src/api/controllers/partnerships/updatePartnerships.controller";
import DeletePartnershipController from "@src/api/controllers/partnerships/deletePartnership.controller";
import GetPartnershipsByUserIdController from "@src/api/controllers/partnerships/getPartnershipsByUserId.controller";
import LegacyPartnershipNotifierAdapter from "@src/infrastructure/adapters/LegacyPartnershipNotifier.adapter";
import {
  authMiddleware,
  mongoosePartnershipRepository,
} from "@/di/container";
import { notificationService } from "@/di/notification.di";

const partnershipNotifier = new LegacyPartnershipNotifierAdapter(
  notificationService
);

const createPartnershipUseCase = new CreatePartnershipUseCase(
  mongoosePartnershipRepository,
  partnershipNotifier
);
const updatePartnershipsUseCase = new UpdatePartnershipsUseCase(
  mongoosePartnershipRepository
);
const deletePartnershipUseCase = new DeletePartnershipUseCase(
  mongoosePartnershipRepository
);
const getPartnershipsByUserIdUseCase = new GetPartnershipsByUserIdUseCase(
  mongoosePartnershipRepository
);

export { authMiddleware };

export const createPartnership = CreatePartnershipController(
  createPartnershipUseCase
);
export const updatePartnership = UpdatePartnershipsController(
  updatePartnershipsUseCase
);
export const deletePartnership = DeletePartnershipController(
  deletePartnershipUseCase
);
export const getPartnershipsByUserId = GetPartnershipsByUserIdController(
  getPartnershipsByUserIdUseCase
);
