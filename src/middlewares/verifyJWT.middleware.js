import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(400, "UnAuthorized Access");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.AT_SECRET);
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    )

    if (!user) {
      throw new ApiError(401, "Invalid Access token");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("Error while verifiying jwt: ", err);
    throw new ApiError(401, "Unable to verify the JW Token");
  }
});
