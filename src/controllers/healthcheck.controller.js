import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isDatabaseConnected } from "../db/connect.js";

const healthCheck = asyncHandler(async (req, res) => {
  const databaseConnected = isDatabaseConnected();

  return res
    .status(databaseConnected ? 200 : 503)
    .json(new ApiResponse(
      databaseConnected ? 200 : 500,
      {
        server: "up",
        database: databaseConnected ? "connected" : "disconnected",
      },
      databaseConnected ? "OK" : "Server Down"
    ));
});

export { healthCheck };
