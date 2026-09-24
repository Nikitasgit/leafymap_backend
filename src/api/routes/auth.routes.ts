import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createAuthRoutes = ({
  authController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "authController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/register", rateLimiterMiddleware.auth(), authController.register());
  router.post("/signin", rateLimiterMiddleware.auth(), authController.signIn());
  router.post("/google", rateLimiterMiddleware.auth(), authController.googleAuth());
  router.post("/signout", authController.signOut());
  router.get("/me", authMiddleware.verifyOptional(), authController.getCurrentUser());
  router.patch("/accept-cgu", authMiddleware.verify(), authController.acceptCgu());
  router.get(
    "/verify-email",
    rateLimiterMiddleware.auth(),
    authController.verifyEmail()
  );
  router.post(
    "/resend-verification-email",
    rateLimiterMiddleware.auth(),
    authController.resendVerificationEmail()
  );
  router.post(
    "/forgot-password",
    rateLimiterMiddleware.auth(),
    authController.requestPasswordReset()
  );
  router.post(
    "/reset-password",
    rateLimiterMiddleware.auth(),
    authController.resetPassword()
  );
  router.post(
    "/two-factor/setup",
    rateLimiterMiddleware.auth(),
    authMiddleware.verify(),
    authController.setupTwoFactor()
  );
  router.post(
    "/two-factor/confirm",
    rateLimiterMiddleware.auth(),
    authMiddleware.verify(),
    authController.confirmTwoFactor()
  );
  router.post(
    "/two-factor/disable",
    rateLimiterMiddleware.auth(),
    authMiddleware.verify(),
    authController.disableTwoFactor()
  );
  router.post(
    "/two-factor/verify",
    rateLimiterMiddleware.auth(),
    authController.verifyTwoFactor()
  );

  return router;
};

export default createAuthRoutes;
