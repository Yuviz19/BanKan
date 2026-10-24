import { Router } from "express";
import {
  organizationMembers,
  updateMemberRole,
  removeMember
} from "../controllers/membership.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { validatePermission } from "../middlewares/permission.middleware.js";
import { updateRoleValidator } from "../validators/membership.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.route("/organizations/:organizationId/members").get(verifyJWT, validatePermission(["OWNER", "ADMIN", "MEMBER"]), organizationMembers);

router.route("/organizations/:organizationId/members/:userId")
  .patch(verifyJWT, validate(updateRoleValidator), validatePermission(["OWNER"]), updateMemberRole)
  .delete(verifyJWT, validatePermission(["OWNER", "ADMIN"]), removeMember);
