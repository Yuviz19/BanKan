import { Organization } from "../models/organisation.model.js";
import { Membership } from "../models/memebership.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import mongoose from "mongoose";

const createOrganization = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const [org] = await Organization.create(
      [{
        title,
        description,
        ownerId: user._id
      }],
      { session }
    );

    const [memebership] = await Membership.create(
      [{
        organisationId: org._id,
        userId: user._id,
        role: "OWNER"
      }],
      { session }
    );

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(
        201,
        { org },
        "Organization is created successfully created"
      ));
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(
      400,
      "Unable to create the Organization",
      { error }
    );
  } finally {
    await session.endSession();
  }
});

const getUserOrganization = asyncHandler(async (req, res) => {
  const user = req.user;
  const orgs = await Membership.aggregate(
    [
      {
        $match: {
          userId: user._id
        }
      },
      {
        $lookup: {
          from: "organizations",
          localField: "organizationId",
          foreignField: "_id",
          as: "orgDetails"
        }
      },
      {
        $unwind: "$orgDetails",
      },
    ]
  );

  if (!orgs.length) {
    throw new ApiError(400, "Unable to get the organisation details");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { orgs },
      "Successfully fetched organization related to user"
    ));
});

const getOrganization = asyncHandler(async (req, res) => {
  const organizationId = req.params;
  const user = req.user;

  const membership = await Membership.findOne({
    userId: user._id,
    organisationId: orgId
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of this organisation");
  }

  const org = await Organization.findById(organizationId);

  if (!org) {
    throw new ApiError(400, "Unable to fetch the organization");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { org },
      "Organization details fetched successfully"
    ));
});

const updateOrganization = asyncHandler(async (req, res) => {
  const user = req.user;
  const organisationIdId = req.params;
  const { title, description } = req.body;

  const membership = await Membership.findOne({
    userId: user._id,
    organizationId
  });

  if (!membership) {
    throw new ApiError(400, "You're not the member of this project");
  }

  let updatedData = {};

  if (title) {
    updatedData.title = title;
  }
  if (description) {
    updatedData.description = description;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const updatedOrg = await Organization.findByIdAndUpdate(
    orgId,
    { $set: updatedData },
    { new: true }
  );

  if (!updatedOrg) {
    throw new ApiError(400, "Unable to update the organization")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { updatedOrg },
      "Organization updated successfully"
    ));
});

const deleteOrganization = asyncHandler(async (req, res) => {
  const user = req.user;
  const organisationIdId = req.params;

  const membership = await Membership.findOne({
    ownerId: user._id,
    organizationId
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of the Organization");
  }

  const deletedOrg = await Organization.findByIdAndDelete(orgId);
  if (!deletedOrg) {
    throw new ApiError(400, "Unable to delete the organization");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { deletedOrg },
      "Successfully deleted the organization"
    ));
});

export {
  createOrganization,
  getUserOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization
}
