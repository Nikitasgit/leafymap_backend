import express, { Router } from "express";
import {
  createPartnership,
  updatePartnership,
  getPartnershipsByUserId,
  deletePartnership,
  authMiddleware,
} from "@src/api/composition/partnerships.composition";

const router: Router = express.Router();

router.get(
  "/user/:userId",
  authMiddleware.verifyOptional(),
  getPartnershipsByUserId.handle()
);
router.put("/update", authMiddleware.verify(), updatePartnership.handle());
router.post("/", authMiddleware.verify(), createPartnership.handle());
router.delete(
  "/:partnershipId",
  authMiddleware.verify(),
  deletePartnership.handle()
);

export default router;
