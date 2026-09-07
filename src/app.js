import express from "express";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";

import logger from "./utils/logger.js";
import morgan from "morgan";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(helmet());
app.use(compression());

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// cors config
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

// logger config
const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const parts = message.trim().split(" ");

        const logObject = {
          method: parts[0],
          url: parts[1],
          status: parts[2],
          responseTime: parts[3],
        };

        logger.info(JSON.stringify(logObject));
      },
    },
  }),
);

// routes

// error handling middleware
app.use(errorHandler);

export default app;
