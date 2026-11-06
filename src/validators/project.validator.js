import { z } from "zod";

export const createProjectValidator = z.object({
  name: z
    .string()
    .min(3, "Project name should be atleast 3 characters long")
    .max(30, "Project name can not be more than 30 characters long"),
  description: z
    .string()
    .optional()
});

export const updateProjectValidator = z.object({
  name: z
    .string()
    .min(3, "Project name should be atleast 3 characters long")
    .max(30, "Project name can not be more than 30 characters long")
    .optional(),
  description: z
    .string()
    .optional()
});

export const createColumnValidator = z.object({
  colName: z
    .string()
    .min(2, "Column name can not be less than 2 characters")
    .max(20, "Columns name can not be more than 20 charcters")
});

export const updateColumnValidator = z.object({
  colName: z
    .string()
    .min(2, "Column name can not be less than 2 characters")
    .max(20, "Columns name can not be more than 20 charcters")
    .optional(),
  position: z
    .number()
    .min(1, "position can not be 0 or negative")
    .optional()
});
