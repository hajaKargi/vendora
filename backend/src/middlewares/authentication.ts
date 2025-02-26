import Jwt from "../utils/security/jwt";
import { Request, Response, NextFunction } from "express";
import {
  ForbiddenError,
  BadRequestError,
  UnauthorizedError,
} from "../core/api/ApiError";
import UserService from "../services/user.service";

// Middleware to check if the user is authorized
export const isAuthorized = (allowedAccountTypes?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token: string | undefined =
        req?.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new UnauthorizedError("Unauthorized"));
      }

      const decoded = Jwt.verify(token as string);

      const loggedInUser = await UserService.readUserById(decoded.payload.id);

      if (!loggedInUser) {
        return next(new UnauthorizedError("Unauthorized"));
      }

      res.locals.account = loggedInUser;

      next();
    } catch (err) {
      next(new UnauthorizedError("Unauthorized"));
    }
  };
};
