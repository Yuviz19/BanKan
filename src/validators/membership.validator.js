import { z } from "zod";

export const updateRoleValidator = z.object({
  role: z
    .enum(["ADMIN", "MEMBER"])
})
