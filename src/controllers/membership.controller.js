import { Membership } from "../models/memebership.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import mongoose from "mongoose";

// get all the members of the organisation
const organizationMembers = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const user = req.user;

  const membership = await Membership.findOne({
    organizationId,
    userId: user._id
  });

  if (!membership) {
    throw new ApiError(403, "User not associated to the organization");
  }

  const orgMembers = await Membership.aggregate(
    [
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
          pipeline: [
            {
              $project: {
                name: 1,
                avatar: 1
              }
            }
          ]
        }
      },
      {
        $unwind: "$userDetails"
      }
    ]
  );

  if (orgMembers.length === 0) {
    throw new ApiError(422, "Unable to fetch the organization members");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { orgMembers },
      "Organization Members fetched successfully"
    ));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { organizationId, userId } = req.params;
  const { role } = req.body;

  const updatedMembership = await Membership.findOneAndUpdate({
    userId: new mongoose.Types.ObjectId(userId),
    organizationId: new mongoose.Types.ObjectId(organizationId)
  },
    {
      role: role
    },
    {
      new: true
    }
  );

  if (!updatedUser) {
    throw new ApiError(401, "Unable to update the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      { updatedMembership },
      "Successfully updated the user role"
    ));
});

const removeMember = asyncHandler(async (req, res) => {
  const { organizationId, userId } = req.params;

  const deletedMembership = await Membership.findOneAndDelete(
    {
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }
  );

  if (!deletedMembership) {
    throw new ApiError(400, "Unable to remove membership");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { deletedMembership },
      "Membership deleted successfully"
    ));
});


export {
  organizationMembers,
  updateMemberRole,
  removeMember
};
