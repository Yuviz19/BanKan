import { Organization } from "../models/organisation.model.js";
import { Membership } from "../models/memebership.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import mongoose from "mongoose";

const createOrganisation = asyncHandler(async (req, res) => {
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
        "Organisation is created successfully created"
      ));
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(
      400,
      "Unable to create the Organisation",
      { error }
    );
  } finally {
    await session.endSession();
  }
});

const getUserOrganisation = asyncHandler(async (req, res) => {
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
          from: "organisations",
          localField: "organisationId",
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
      "Successfully fetched organisation related to user"
    ));
});

const getOrganisation = asyncHandler(async (req, res) => {
  const orgId = req.params;
  const user = req.user;

  const membership = await Membership.findOne({
    userId: user._id,
    organisationId: orgId
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of this organisation");
  }

  const org = await Organization.findById(orgId);

  if (!org) {
    throw new ApiError(400, "Unable to fetch the organisation");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { org },
      "Organisation details fetched successfully"
    ));
});

const updateOrganisation = asyncHandler(async (req, res) => {
  const user = req.user;
  const orgId = req.params;
  const { title, description } = req.body;

  const membership = await Membership.findOne({
    userId: user._id,
    organisationId: orgId
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
    throw new ApiError(400, "Unable to update the organisation")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { updatedOrg },
      "Organisation updated successfully"
    ));
});

const deleteOrganisation = asyncHandler(async (req, res) => {
  const user = req.user;
  const orgId = req.params;

  const membership = await Membership.findOne({
    ownerId: user._id,
    organisationId: orgId
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of the Organisation");
  }

  const deletedOrg = await Organization.findByIdAndDelete(orgId);
  if (!deletedOrg) {
    throw new ApiError(400, "Unable to delete the organisation");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { deletedOrg },
      "Successfully deleted the organisation"
    ));
});

export {
  createOrganisation,
  getUserOrganisation,
  getOrganisation,
  updateOrganisation,
  deleteOrganisation
}
