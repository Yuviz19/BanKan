import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";
import { Membership } from "../models/memebership.model.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createInvitation = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { email, role } = req.body;

  const user = await User.findOne({
    email
  });

  if (!user) {
    throw new ApiError(404, "No such user exists");
  }

  const membership = await Membership.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    userId: user._id
  });

  if (membership) {
    throw new ApiError(400, "User already exists in the Organisations");
  }

  const pendingInv = await Invitation.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    email,
    status: "PENDING"
  });

  if (pendingInv) {
    throw new ApiError(400, "User already has pending invitation");
  }

  const expiresAt = new Date(
    Date.now() + 48 * 60 * 60 * 1000
  );

  const invitation = await Invitation.create({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    email,
    role,
    expiresAt,
    invitedBy: req.user._id
  });

  if (!invitation) {
    throw new ApiError(400, "Unable to send the invitation");
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      { invitation },
      "Invitation send successfully"
    ));
});

const listOrgInvitations = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const invitations = await Invitation.aggregate(
    [
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "email",
          foreignField: "email",
          as: "userInfo",
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
        $unwind: "$userInfo"
      }
    ]
  );

  if (invitations.length === 0) {
    throw new ApiError(400, "Unable to fetch the organization invitations");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { invitations },
      "Organization invitations fetched successfully"
    ));
});

const listUsersInvitations = asyncHandler(async (req, res) => {
  const user = req.user;

  if (membership) {
    throw new ApiError(400, "User already part of an existing organization");
  }

  const invitations = await Invitation.find({
    email: user.email
  });

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { invitations },
      "User Invitations fetched successfullly"
    ));
});

const acceptInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;

  const invitation = await Invitation.findOne({
    _id: new mongoose.Types.ObjectId(invitationId),
    email: req.user.email,
    status: "PENDING"
  });

  if (!invitation) {
    throw new ApiError(404, "Unable to find Invitation");
  }

  if (new Date() > invitation.expiresAt) {
    throw new ApiError(400, "Invitation is expired");
  }

  const membership = await Membership.findOne({
    userId: req.user._id
  });

  if (membership) {
    throw new ApiError(400, "User already a part of an existing organization, (ask authorities to remove the user)");
  }

  const newMembership = await Membership.create({
    organizationId: invitation.organizationId,
    userId: req.user._id,
    role: invitation.role
  });

  invitation.status = "ACCEPTED";
  await invitation.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { membership: newMembership },
      "User successfully joined the organization"
    ));
});

const rejectInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;
  const invitation = await Invitation.findOne({
    _id: new mongoose.Types.ObjectId(invitationId),
    email: req.user.email,
    status: "PENDING"
  });

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  if (new Date() > invitation.expiresAt) {
    throw new ApiError(400, "Invitation has expired");
  }

  invitation.status = "CANCELLED";
  await invitation.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Invitation has been rejected"
    ));
});

// organization side controller
const cancelInvitation = asyncHandler(async (req, res) => {
  const { invitationId } = req.params;

  const invitation = await Invitation.findOne({
    _id: new mongoose.Types.ObjectId(invitationId),
    status: "PENDING"
  });

  if (!invitation) {
    throw new ApiError(400, "Unable to find the invitations");
  }

  invitation.status = "CANCELLED";
  invitation.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Invitation has been cancelled successfullly"
    ));
});

export {
  createInvitation,
  listOrgInvitations,
  listUsersInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation
};
