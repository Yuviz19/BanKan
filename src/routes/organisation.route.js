import { Router } from "express";
import {
  createOrganization,
  getUserOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization
} from "../controllers/organization.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { validatePermission } from "../middlewares/permission.middleware.js";
import {
  createOrgValidator,
  updateOrgValidator
} from "../validators/organization.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.route("/organization")
  .post(verifyJWT, validate(createOrgValidator), createOrganization)
  .get(verifyJWT, getUserOrganization)
router.route("/:organizationId")
  .get(verifyJWT, validatePermission(["OWNER", "ADMIN", "MEMBER"]), getOrganization)
  .patch(verifyJWT, validate(updateOrgValidator), validatePermission(["OWNER", "ADMIN"]), updateOrganization)
  .delete(verifyJWT, validatePermission(["OWNER"]), deleteOrganization);

export default router;
