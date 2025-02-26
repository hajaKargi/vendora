const { ethers } = require("ethers");

import { Request, Response } from "express";
import asyncHandler from "../middlewares/async";
import { SuccessResponse, BadRequestResponse } from "../core/api/ApiResponse";
import { BadRequestError, InternalError } from "../core/api/ApiError";
import UserService from "../services/user.service";
import Jwt from "../utils/security/jwt";
import WalletService from "../services/wallet.service";
import serverSettings from "../core/config/settings";
import EmailNotifier from "../utils/service/emailNotifier";
import Bcrypt from "../utils/security/bcrypt";
import { User } from "@prisma/client";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, walletAddress } = req.body;

  const existingUser = await UserService.readUserByEmail(email);

  if (existingUser) {
    throw new BadRequestError("Email already registered");
  }

  // Validate wallet address
  if (!ethers.isAddress(walletAddress)) {
    throw new BadRequestError("Invalid wallet address");
  }

  // Check if wallet address is already in use
  const existingWallet =
    await WalletService.readWalletByWalletAddress(walletAddress);

  if (existingWallet) {
    throw new BadRequestError("Wallet address already registered");
  }

  // Hash password
  const hashedPassword = await Bcrypt.hashPassword(password);

  const result = await UserService.registerUser({
    email,
    hashedPassword,
    firstName,
    lastName,
    walletAddress,
  });

  await WalletService.createWallet(result.id, walletAddress);

  const verificationToken = Jwt.issue({ userId: result.id }, "1d");

  // Send verification email
  const verificationLink = `${serverSettings.auroraWebApp.baseUrl}/verify-email?token=${verificationToken}`;
  EmailNotifier.sendAccountActivationEmail(email, verificationLink);

  const userResponse: Partial<User> = { ...result };
  delete userResponse.password;

  return new SuccessResponse(
    "Registration successful. Please verify your email.",
    userResponse
  ).send(res);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      throw new BadRequestError("Verification token is required");
    }

    const decoded = Jwt.verify(token);
    const userId = (decoded as any).payload.userId;

    console.log(decoded);

    // Update user verification status
    const updatedUser = await UserService.activateEmail(userId);

    if (!updatedUser) {
      throw new BadRequestError("User not found");
    }

    return new SuccessResponse("Email verified successfully", {}).send(res);
  } catch (err) {
    console.log(err);
    throw new BadRequestError("Invalid token");
  }
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await UserService.readUserByEmail(email);

  if (!user) {
    throw new BadRequestError("Invalid credentials");
  }

  if (!user.isEmailVerified) {
    throw new BadRequestError(
      "Email not verified. Please verify your email first."
    );
  }

  const isPasswordValid = await Bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new BadRequestError("Invalid credentials");
  }

  const authenticationToken = Jwt.issue({ id: user.id }, "1d");

  const userResponse: Partial<User> = { ...user };
  delete userResponse.password;

  return new SuccessResponse("Login successful", {
    userResponse,
    authenticationToken,
  }).send(res);
});
