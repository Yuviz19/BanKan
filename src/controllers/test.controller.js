import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const testCheck = asyncHandler(async (req, res) => {
  throw new ApiError(404, "Server not responding (test)");
})

export { testCheck };
