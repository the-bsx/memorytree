import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

import { Router } from "express";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(authMiddleware, logoutUser);
router.route("/refresh-token").post(refreshToken);

export default router;
