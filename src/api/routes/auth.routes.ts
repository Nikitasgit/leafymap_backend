import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { authController, authMiddleware, rateLimiterMiddleware } = cradle;

const router: Router = express.Router();

router.post("/register", rateLimiterMiddleware.auth(), authController.register());
router.post("/signin", rateLimiterMiddleware.auth(), authController.signIn());
router.post("/google", rateLimiterMiddleware.auth(), authController.googleAuth());
router.post("/signout", authController.signOut());
router.get("/me", authMiddleware.verify(), authController.getCurrentUser());
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

export default router;
