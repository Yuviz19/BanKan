import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/api_response.js";
import { ApiError } from "../utils/api_error.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Card } from "../models/card.model.js";
import { Membership } from "../models/memebership.model.js";
import { Project } from "../models/project.model.js";

const createCard = asyncHandler(async (req, res) => {
  const { projectId, columnId } = req.params;
  const { title, description, priority, due, assignedUserMail } = req.body;

  if (!title?.trim()) {
    throw new ApiError(400, "Card title is required")
  }

  // validation
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Unable to find the Project");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(403, "You're not a part of this organization");
  }

  const column = project.columns.id(columnId);
  if (!column) {
    throw new ApiError(404, "Unable to find the column");
  }

  const lastCard = await Card.findOne({
    projectId,
    columnId
  }).sort({ position: -1 });

  const position = lastCard ? lastCard.position + 1000 : 1000;
  let optionalData = {};

  optionalData.position = position;
  if (description !== undefined) {
    optionalData.description = description;
  }
  if (priority !== undefined) {
    optionalData.priority = priority;
  }
  if (due !== undefined) {
    optionalData.dueDate = due;
  }
  if (assignedUserMail !== undefined) {
    const user = await User.findOne({
      email: assignedUserMail
    });

    if (!user) {
      throw new ApiError(404, "No such user found");
    }

    const member = await Membership.findOne({
      organizationId: project.organization,
      userId: user._id
    });

    if (!member) {
      throw new ApiError(403, "The user is not a part of this organization")
    }

    optionalData.assignedTo = user._id;
  }

  const card = await Card.create({
    title,
    ...optionalData,
    projectId,
    columnId,
    createdBy: req.user._id
  });

  if (!card) {
    throw new ApiError(400, "Unable to craete the card");
  }

  return res
    .status(201)
    .json(new ApiResponse(
      201,
      { card },
      "Card created successfully"
    ));
});

const getProjectCards = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Unable to find the project")
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });

  if (!membership) {
    throw new ApiError(403, "You're not a part of this organization")
  }

  const cards = await Card.find({
    projectId
  }).sort({
    columnId: 1,
    position: 1
  });

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { cards },
      "Project cards fetched successfully"
    ));
});

const getCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;

  const card = await Card.findById(cardId)
    .populate("assignedTo", "name email avatar")
    .populate("createdBy", "name email avatar")

  if (!card) {
    throw new ApiError(404, "Card not found")
  }

  const project = await Project.findById(card.projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });
  if (!membership) {
    throw new ApiError(403, "You're not a part of this organization");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { card },
      "Card fetched successfully"
    ));
});

const updateCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { title, description, priority, dueDate, assignedToEmail, unassign } = req.body;

  if (assignedToEmail !== undefined && unassign === true) {
    throw new ApiError(403, "Both assignment and unassignment can not be done at the same time");
  }

  const card = await Card.findById(cardId);
  if (!card) {
    throw new ApiError(404, "Card not found")
  }

  const project = await Project.findById(card.projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });
  if (!membership) {
    throw new ApiError(403, "You're not a part of this organization");
  }

  let updatedData = {};
  if (assignedToEmail?.trim().toLowerCase() !== undefined) {
    const user = await User.findOne({
      email: assignedToEmail
    });

    if (!user) {
      throw new ApiError(404, "No such user found")
    }

    const member = await Membership.findOne({
      organizationId: project.organization,
      userId: user._id
    });

    if (!member) {
      throw new ApiError(403, "User is not a part of the organization")
    }
    updatedData.assignedTo = user._id;
  }

  if (unassign === true) {
    updatedData.assignedTo = null;
  }
  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Title can not be empty");
    }
    updatedData.title = title;
  }
  if (description !== undefined) {
    updatedData.description = description;
  }
  if (priority !== undefined) {
    updatedData.priority = priority;
  }
  if (dueDate !== undefined) {
    updatedData.dueDate = dueDate;
  }

  if (Object.keys(updatedData).length === 0) {
    throw new ApiError(400, "No fields provided for update");
  }

  const updateCard = await Card.findByIdAndUpdate(
    cardId,
    {
      $set: updatedData
    },
    { new: true }
  );

  if (!updateCard) {
    throw new ApiError(400, "Unable to update the card");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { card: updateCard },
      "The card has been updated"
    ));
});

const deleteCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const card = await Card.findById(cardId);

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  const project = await Project.findById(card.projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });
  if (!membership) {
    throw new ApiError(403, "You're not a part of the project");
  }

  const delCard = await Card.findByIdAndDelete(cardId);
  if (!delCard) {
    throw new ApiError(400, "Unable to delete the card");
  }

  return res
    .status(204)
    .json(new ApiResponse(
      204,
      {},
      "Card deleted successfully"
    ));
});

const moveCard = asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { targetColumnId } = req.body;

  const card = await Card.findById(cardId);
  if (!card) {
    throw new ApiError(404, "Unable to find the Card");
  }

  const project = await Project.findById(card.projectId);
  if (!project) {
    throw new ApiError(404, "Unable to find the project");
  }

  const membership = await Membership.findOne({
    organizationId: project.organization,
    userId: req.user._id
  });
  if (!membership) {
    throw new ApiError(403, "You're not part of the organization");
  }

  const column = project.columns.id(targetColumnId);
  if (!column) {
    throw new ApiError(400, "No Column found");
  }

  if (card.columnId.equals(targetColumnId)) {
    throw new ApiError(400, "Card is already in this column");
  }

  const lastCard = await Card.findOne(
    {
      projectId: project._id,
      columnId: targetColumnId
    },
  ).sort({ position: -1 });

  const position = lastCard ? lastCard.position + 1000 : 1000;

  const updateCard = await Card.findByIdAndUpdate(
    cardId,
    {
      columnId: targetColumnId,
      position
    },
    { new: true }
  );

  if (!updateCard) {
    throw new ApiError(400, "Unable to update the card");
  }

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      { card: updateCard },
      "Card position has been updated"
    ));
});

export {
  createCard,
  getProjectCards,
  getCard,
  updateCard,
  deleteCard,
  moveCard
}
