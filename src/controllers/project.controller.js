import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import mongoose from "mongoose";
import { Membership } from "../models/memebership.model.js";
import { Project } from "../models/project.model.js";
import { Organization } from "../models/organisation.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { name, description } = req.body;

  const organization = await Organization.findById(
    new mongoose.Types.ObjectId(organizationId)
  );

  if (!organization) {
    throw new ApiError(404, "Unable to find the organization")
  }

  const project = await Project.create({
    oragnizationId: new mongoose.Types.ObjectId(organizationId),
    name,
    description,
    createdBy: req.user._id
  });

  if (!project) {
    throw new ApiError(400, "Unable to create Project")
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      { project },
      "Project created successfully"
    ));
});

const lisOrgProject = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const projects = await Project.find({
    organization: new mongoose.Types.ObjectId(organizationId)
  }).select("-columns");

  if (!projects) {
    throw new ApiError(404, "Unable to fetch Projects")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { projects },
      "Projects fetched successfully"
    ));
});

// this end point will work a "getProjCards" controller in cards controller
// keeping this at is in V1, as cards controller is still not ready
const getProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Unable to fetch the Project")
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { project },
      "Project fetched successfully"
    ));
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  let updatedData = {};
  if (name) {
    updatedData.name = name;
  }

  if (description) {
    updatedData.description = description;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const project = Project.findByIdAndDelete(
    projectId,
    { $set: updatedData },
    { new: true }
  );

  if (!project) {
    throw new ApiError(400, "Unable to update the project");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { project },
      "The project has been updated successfully"
    ));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(400, "Unable to update the project");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Project has beed deleted successfully"
    ));
});
