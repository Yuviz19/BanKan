import { z } from "zod";

export const registrationValidator = z.object({
  name: z
    .string()
    .min(2, "Name should be atleast 2 characters long")
    .max(50, "Name above 50 charcters is not allowed"),

  email: z
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(8, "Password should be atleast 8 characters long")
    .max(20, "Password can not exceed 20 characters"),

  avatar: z
    .string()
    .optional()
})
