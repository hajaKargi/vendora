import morgan from "morgan";
import settings from "./settings";
import logger from "./logger";
import { Request, Response } from "express";

morgan.token(
  "message",
  (req: Request, res: Response) => res.locals.errorMessage || ""
);

const getIpFormat = () =>
  settings.serverEnvironment === "PRODUCTION" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: any) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: any) => logger.error(message.trim()) },
});

export default {
  successHandler,
  errorHandler,
};
