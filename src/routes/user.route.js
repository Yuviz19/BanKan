import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registrationValidator } from "../validators/user.validator.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register-user").post(upload.single("avatar"), validate(registrationValidator), registerUser);

export default router;
