import CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import CreatePartnershipController from "@src/api/controllers/partnerships/createPartnership.controller";
import UpdatePartnershipsController from "@src/api/controllers/partnerships/updatePartnerships.controller";
import DeletePartnershipController from "@src/api/controllers/partnerships/deletePartnership.controller";
import GetPartnershipsByUserIdController from "@src/api/controllers/partnerships/getPartnershipsByUserId.controller";
import PartnershipNotifierAdapter from "@src/infrastructure/adapters/PartnershipNotifier.adapter";
import {
  authMiddleware,
  createNotificationUseCase,
  mongoosePartnershipRepository,
} from "@src/di/container";

const partnershipNotifier = new PartnershipNotifierAdapter(
  createNotificationUseCase
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
export const updatePartnerships = UpdatePartnershipsController(
  updatePartnershipsUseCase
);
export const deletePartnership = DeletePartnershipController(
  deletePartnershipUseCase
);
export const getPartnershipsByUserId = GetPartnershipsByUserIdController(
  getPartnershipsByUserIdUseCase
);
