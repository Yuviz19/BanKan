import { z } from "zod";

export const createInvitationValidator = z.object({
  email: z
    .email("Please provide a valid email id"),
  role: z
    .enum(["MEMBER", "ADMIN"])
});
