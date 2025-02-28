// src/routes/wallet.routes.ts

import express from "express";
import {
  generateWalletChallenge,
  verifyWalletSignature,
} from "../../../controllers/wallet.controller";
import {
  walletChallengeValidation,
  walletVerificationValidation,
} from "../../../models/validations/wallet.validators";
import validateRequest from "../../../middlewares/validator";
import { isAuthorized } from "../../../middlewares/authentication";

const router = express.Router();

// Generate challenge for wallet verification
router.post(
  "/challenge",
  isAuthorized(),
  validateRequest(walletChallengeValidation),
  generateWalletChallenge
);

// Verify wallet with signature
router.post(
  "/verify",
  isAuthorized(),
  validateRequest(walletVerificationValidation),
  verifyWalletSignature
);

export default router;
