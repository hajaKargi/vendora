import { config } from "dotenv";

import express, { Application } from "express";
import ErrorHandler from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "./core/config/morgan";
import { NotFoundError } from "./core/api/ApiError";

// securing api packages
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";

// Load Environment
config();

const app: Application = express();

// cookie parser
app.use(cookieParser());

// import routes files
import apiRoutes from "./routes/api/index";
import webRoutes from "./routes/web/index";
import settings from "./core/config/settings";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (settings.serverEnvironment !== "TEST") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(cors());

app.use(helmet());

// api request rate limiting default : 100 requests in 10minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 20000,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// initialize routers
app.use("/api/v1", apiRoutes);
app.use("/", webRoutes);
app.get("/error", (req, res) => {
  throw new Error("DOn't play games");
});

// Handle 404 Requests
app.use("*", (req, res, next) => next(new NotFoundError()));


// error handler
app.use(ErrorHandler);

export default app;
