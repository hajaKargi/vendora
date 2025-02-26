import express from "express";
import { isAuthorized } from "../../../middlewares/authentication";
import { getAuthenticatedUser } from "../../../controllers/account.controller";

const router = express.Router();

router.get("/me", isAuthorized(), getAuthenticatedUser);

export default router;
