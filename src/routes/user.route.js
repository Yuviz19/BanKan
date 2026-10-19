import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  renewAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registrationValidator, loginValidator, updatePasswordValidator, updateProfileValidator  } from "../validators/user.validator.js";
import { upload  } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.route("/register-user").post(upload.single("avatar"), validate(registrationValidator), registerUser);
router.route("/login").post(validate(loginValidator), loginUser);
router.route("/logout").patch(verifyJWT, logoutUser);
router.route("/renew-access-token").patch(renewAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(upload.single("avatar"), verifyJWT, validate(updateProfileValidator), updateProfile);
router.route("update-passoword").patch(verifyJWT, validate(updatePasswordValidator), changePassword);

export default router;
