import { Membership } from "../models/memebership.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";

export const validatePermission = (role = []) => {
  return asyncHandler(async (req, res, next) => {
    const { organisationId } = req.params;
    const user = req.user;
    if (!orgId) {
      throw new ApiError(400, "Organisation Id is missing");
    }

    const membership = await Membership.findOne({
      ownerId: user._id,
      organisationId
    });

    if (!membership) {
      throw new ApiError(400, "No such Organisation exists");
    }

    const userRole = membership?.role;

    if (!role.includes(userRole)) {
      throw new ApiError(400, "You are not authorized to performed this task");
    }

    next();
  });
}
