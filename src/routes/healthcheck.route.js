import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";
import { testCheck } from "../controllers/test.controller.js";

const router = Router();

router.route("/").get(healthCheck);
router.route("/test").get(testCheck);

export default router;
