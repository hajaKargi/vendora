import express from "express";

const apiRoutes = express.Router();
import authRoutes from "./modules/auth.routes";
import accountRoutes from "./modules/account.routes";
import walletRoutes from "./modules/wallet.routes";

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/account", accountRoutes);
apiRoutes.use("/wallet", walletRoutes);

export default apiRoutes;
