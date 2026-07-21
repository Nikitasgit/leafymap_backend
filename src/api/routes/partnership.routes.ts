import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createPartnershipRoutes = ({
  partnershipsController,
  authMiddleware,
}: Pick<RouteDependencies, "partnershipsController" | "authMiddleware">): Router => {
  const router: Router = express.Router();

  router.get(
    "/user/:userId",
    authMiddleware.verifyOptional(),
    partnershipsController.listByUser()
  );
  router.put("/update", authMiddleware.verify(), partnershipsController.update());
  router.post("/", authMiddleware.verify(), partnershipsController.create());
  router.delete(
    "/:partnershipId",
    authMiddleware.verify(),
    partnershipsController.delete()
  );

  return router;
};

export default createPartnershipRoutes;
