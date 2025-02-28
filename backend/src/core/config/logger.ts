import winston, { format, transports } from "winston";
import settings from "./settings";

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    return { ...info, message: info.stack };
  }
  return info;
});

const logger = winston.createLogger({
  level: settings.serverEnvironment === "DEVELOPMENT" ? "debug" : "info",
  format: format.combine(
    enumerateErrorFormat(),
    settings.serverEnvironment === "DEVELOPMENT"
      ? format.colorize()
      : format.uncolorize(),
    format.splat(),
    format.printf((info) => {
      const { level, message } = info as { level: string; message: string };
      return `${level}: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

export default logger;
