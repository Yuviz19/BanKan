import dotenv from "dotenv";
import app from "./app.js"
import connect from "./db/connect.js";
import logger from "./utils/logger.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connect()
  .then(() => {
    app.listen(port, () => {
      logger.info(`App is listning on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    logger.error("connection failed", err);
  })
