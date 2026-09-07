import { createLogger, format, transports } from "winston";

const { combine, timestamp, json, colorize, printf } = format;

const consoleLogFormat = combine(
  colorize(),
  timestamp(),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  }),
);

const logger = createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: "logs/app.log",
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
  ],
});

export default logger;
