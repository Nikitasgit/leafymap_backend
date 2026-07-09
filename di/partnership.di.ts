import { PartnershipRepository, UserRepository } from "@/repositories";
import {
  CreatePartnershipsAction,
  UpdatePartnershipsAction,
  GetPartnershipsByUserIdAction,
  DeletePartnershipAction,
} from "@/actions/partnerships";
import {
  CreatePartnershipsController,
  UpdatePartnershipsController,
  GetPartnershipsByUserIdController,
  DeletePartnershipController,
} from "@/controllers/partnerships";
import { AuthMiddleware } from "@/middlewares";
import { notificationService } from "@/di/notification.di";

// Initialize repositories
const partnershipRepository = new PartnershipRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);

// Initialize actions
const createPartnershipsAction = new CreatePartnershipsAction(
  partnershipRepository,
  notificationService
);
const updatePartnershipsAction = new UpdatePartnershipsAction(
  partnershipRepository
);
const getPartnershipsByUserIdAction = new GetPartnershipsByUserIdAction(
  partnershipRepository
);
const deletePartnershipAction = new DeletePartnershipAction(
  partnershipRepository
);

// Initialize controllers
export const createPartnership = CreatePartnershipsController(
  createPartnershipsAction
);
export const updatePartnership = UpdatePartnershipsController(
  updatePartnershipsAction
);
export const getPartnershipsByUserId = GetPartnershipsByUserIdController(
  getPartnershipsByUserIdAction
);
export const deletePartnership = DeletePartnershipController(
  deletePartnershipAction
);
