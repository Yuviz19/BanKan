import { z } from "zod";

export const createOrgValidator = z.object({
  title: z
    .string()
    .min(3, "Organisation name should be atleast 3 characters long")
    .max(30, "Organisation name can not exceed 30 characters"),

  description: z
    .string()
    .optional()
});

export const updateOrgValidator = z.object({
  title: z
    .string()
    .min(3, "Organisation name should be atleast 3 characters long")
    .max(30, "Organisation name can not exceed 30 characters")
    .optional(),

  description: z
    .string()
    .optional()
})
