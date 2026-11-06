import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/api_error.js";
import { ApiResponse } from "../utils/api_response.js";
import mongoose from "mongoose";
import { Membership } from "../models/memebership.model.js";
import { Project } from "../models/project.model.js";
import { Organization } from "../models/organisation.model.js";
import { Card } from "../models/card.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;
  const { name, description } = req.body;

  const organization = await Organization.findById(
    new mongoose.Types.ObjectId(organizationId)
  );

  if (!organization) {
    throw new ApiError(404, "Unable to find the organization")
  }

  const membership = await Membership.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of this project")
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

const listOrgProject = asyncHandler(async (req, res) => {
  const { organizationId } = req.params;

  const membership = await Membership.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of this project")
  }

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

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(404, "User does not belong to Organization");
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
  if (name !== undefined) {
    updatedData.name = name;
  }

  if (description !== undefined) {
    updatedData.description = description;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const project = await Project.findByIdAndUpdate(
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
  const cards = await Card.deleteMany({
    projectId
  });

  if (!project || !cards) {
    throw new ApiError(400, "Unable to delete the project");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      {},
      "Project has beed deleted successfully"
    ));
});

const createColumn = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { colName } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Unable to find the project");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(400, "User does not belong to the project");
  }

  const colExists = project.columns.some((col) => {
    return col.name.toLowerCase() === colName.toLowerCase();
  })

  if (colExists) {
    throw new ApiError(400, "Column with the same already exists");
  }

  const lastCol = project.columns[project.columns.length - 1];
  const newCol = lastCol.position + 1000;

  project.columns.push({
    name: colName,
    position: newCol
  });

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { project },
      "Project column updates successfully"
    ));
});

const updateColumn = asyncHandler(async (req, res) => {
  const { projectId, columnId } = req.params;
  const { colName, position } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Could not find a project");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(400, "You're not a part of the organization");
  }

  const column = project.columns.id(columnId);
  if (!columnId){
    throw new ApiError(404, "Column not found");
  }

  if (colName !== undefined){
    column.name = colName;
  }

  if (position !== undefined){
    column.position = position;
  }

  await project.save();

  return res
  .status(200)
  .json(new ApiResponse(
      200,
      { project },
      "Column updated successfully"
    ));
});

const deleteColumn = asyncHandler(async (req, res) => {
  const { projectId, columnId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Unable to fetch project");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(400, "You're not the part of the organization");
  }

  project.columns = project.columns.filter((col) => {
    col._id.toString() !== columnId;
  });

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { project },
      "Column deleted successsfully"
    ));
});

export {
  createProject,
  listOrgProject,
  getProject,
  updateProject,
  deleteProject,
  createColumn,
  updateColumn,
  deleteColumn
};
