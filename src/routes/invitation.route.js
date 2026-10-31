import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import {
  createInvitation,
  listOrgInvitations,
  listUsersInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation
} from "../controllers/invitation.controller.js"
import { createInvitationValidator } from "../validators/invitation.validator.js";
import { validatePermission } from "../middlewares/permission.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.route("/:organizationId")
  .post(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(createInvitationValidator), createInvitation)
  .get(verifyJWT, validatePermission(["ADMIN", "OWNER"]), listOrgInvitations);
router.route("/")
  .get(verifyJWT, listUsersInvitations);
router.route("/accept/:invitationId")
  .patch(verifyJWT, acceptInvitation);
router.route("/reject/:invitationId")
  .patch(verifyJWT, rejectInvitation);
router.route("/revoke/:invitattionId")
  .patch(verifyJWT, cancelInvitation);

export default router;
