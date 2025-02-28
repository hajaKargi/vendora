import { Request, Response } from "express";
import { SuccessResponse } from "../core/api/ApiResponse";
import asyncHandler from "../middlewares/async";
import UserService from "../services/user.service";
import { User } from "@prisma/client";


export const getAuthenticatedUser = asyncHandler(async (req: Request, res: Response) => {
  const user = res.locals.account;

  if (!user || !user.id) {
    return new SuccessResponse("User not found", null).send(res);
  }

  const loggedInUser = await UserService.readUserById(user.id);
  
  // Remove password from response
  const userResponse: Partial<User> = { ...loggedInUser };
  delete userResponse.password;

  return new SuccessResponse(
    "User profile retrieved successfully",
    userResponse
  ).send(res);
});