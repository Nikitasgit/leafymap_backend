import express, { Router } from "express";
import {
  register,
  signIn,
  signOut,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  googleAuth,
  acceptCgu,
  verifyEmail,
  resendVerificationEmail,
  authMiddleware,
  rateLimiterMiddleware,
} from "../di/auth.di";

const router: Router = express.Router();

router.post("/register", rateLimiterMiddleware.auth(), register.handle());
router.post("/signin", rateLimiterMiddleware.auth(), signIn.handle());
router.post("/google", rateLimiterMiddleware.auth(), googleAuth.handle());
router.post("/signout", signOut.handle());
router.get("/me", authMiddleware.verify(), getCurrentUser.handle());
router.patch("/accept-cgu", authMiddleware.verify(), acceptCgu.handle());
router.get("/verify-email", rateLimiterMiddleware.auth(), verifyEmail.handle());
router.post(
  "/resend-verification-email",

  resendVerificationEmail.handle(),
);
router.post(
  "/forgot-password",
  rateLimiterMiddleware.auth(),
  requestPasswordReset.handle(),
);
router.post(
  "/reset-password",
  rateLimiterMiddleware.auth(),
  resetPassword.handle(),
);

export default router;
