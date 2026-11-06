import { Router } from "express";
import {
  createProject,
  listOrgProject,
  getProject,
  updateProject,
  deleteProject,
  createColumn,
  updateColumn,
  deleteColumn
} from "../controllers/project.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { validatePermission } from "../middlewares/permission.middleware.js";
import {
  createProjectValidator,
  updateProjectValidator,
  createColumnValidator,
  updateColumnValidator
} from "../validators/project.validator.js";

const router = Router();

router.route("/organizations/:organizationId/projects")
  .post(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(createProjectValidator), createProject)
  .get(verifyJWT, listOrgProject);

router.route("/:projectId")
  .get(verifyJWT, getProject)
  .patch(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(updateProjectValidator), updateProject)
  .delete(verifyJWT, validatePermission(["ADMIN", "OWNER"]), deleteProject)

router.route("/:projectId/columns")
  .post(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(createColumnValidator), createColumn)

router.route("/:projectId/columns/:columnId")
  .patch(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(updateColumnValidator), updateColumn)
  .delete(verifyJWT, validatePermission(["ADMIN", "OWNER"]), deleteColumn)

export default router;
