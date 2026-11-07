import { z } from "zod";
import mongoose from "mongoose";

// reusable code
const objectIdValidator = z.string().refine(
  id => mongoose.isValidObjectId(id),
  { message: "Invalid MongoDB ObjectId" }
);

export const createCardValidator = z.object({
  title: z
    .string()
    .min(3, "Title should be atleast 3 characters long")
    .max(20, "Title can not more than 20 characters long"),
  description: z
    .string()
    .optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),
  due: z
    .coerce
    .date()
    .refine(date => date > new Date(),
      { message: "Due date must be in future" }
    )
    .optional(),
  assignedUserMail: z
    .email("Should be a valid email")
    .optional()
});

export const updateCardValidator = z.object({
  title: z
    .string()
    .min(3, "Title should be atleast 3 characters long")
    .max(20, "Title can not more than 20 characters long")
    .optional(),
  description: z
    .string()
    .optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .optional(),
  dueDate: z
    .coerce
    .date()
    .refine(date => date > new Date(),
      { message: "Due date must be in future" }
    )
    .optional(),
  assignedToEmail: z
    .email("Should be a valid email")
    .optional(),
  unassign: z
    .boolean()
    .optional()
});

export const moveCardValidator = z.object({
  targetColumnId: z
    .string()
    .refine(
      id => mongoose.isValidObjectId(id),
      { message: "Invalid MongoDB objectID" }
    )
});
