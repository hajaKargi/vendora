import { Request, Response } from "express";
import { ethers } from "ethers";
import asyncHandler from "../middlewares/async";
import { SuccessResponse } from "../core/api/ApiResponse";
import { BadRequestError } from "../core/api/ApiError";
import WalletService from "../services/wallet.service";

export const generateWalletChallenge = asyncHandler(
  async (req: Request, res: Response) => {
    const { walletAddress } = req.body;

    // Validate wallet address format
    if (!ethers.isAddress(walletAddress)) {
      throw new BadRequestError("Invalid wallet address format");
    }

    // Generate a random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();

    // Create the challenge message
    const message = `Verify ownership of wallet address ${walletAddress} for AURORA Platform. Nonce: ${nonce}`;

    // Store the challenge in the database
    await WalletService.storeWalletChallenge(walletAddress, message, nonce);

    return new SuccessResponse("Challenge generated successfully", {
      message,
      walletAddress,
    }).send(res);
  }
);

/**
 * Verify wallet ownership with signature
 */
export const verifyWalletSignature = asyncHandler(
  async (req: Request, res: Response) => {
    const { walletAddress, signature } = req.body;
    const userId = res.locals.account.id;

    // Get the wallet from the database
    const wallet = await WalletService.readWalletByWalletAddress(walletAddress);

    if (!wallet) {
      throw new BadRequestError("Wallet address not found");
    }

    if (wallet.userId !== userId) {
      throw new BadRequestError(
        "Wallet address does not belong to authenticated user"
      );
    }

    // Get the challenge from the database
    const challenge = await WalletService.getWalletChallenge(walletAddress);

    if (!challenge) {
      throw new BadRequestError(
        "No active challenge found for this wallet address"
      );
    }

    try {
      // Verify signature
      const messageHash = ethers.hashMessage(challenge.message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      // Check if the recovered address matches the claimed wallet address
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new BadRequestError("Invalid signature");
      }

      // Mark the wallet as verified
      await WalletService.verifyWallet(walletAddress);

      // Remove the challenge after verification
      await WalletService.removeWalletChallenge(walletAddress);

      return new SuccessResponse("Wallet verified successfully", {
        walletAddress,
        verified: true,
      }).send(res);
    } catch (error) {
      console.error("Wallet verification error:", error);
      throw new BadRequestError("Failed to verify wallet signature");
    }
  }
);