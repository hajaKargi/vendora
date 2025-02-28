import express from "express";
import {
  register,
  verifyEmail,
  login,
} from "../../../controllers/auth.controller";
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
} from "../../../models/validations/auth.validators";
import validateRequest from "../../../middlewares/validator";

const router = express.Router();

// Registration endpoint
router.post("/register", validateRequest(registerValidation), register);

// Email verification endpoint
router.get(
  "/verify-email",
  validateRequest(verifyEmailValidation),
  verifyEmail
);

// Login endpoint
router.post("/login", validateRequest(loginValidation), login);

export default router;
