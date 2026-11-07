import { Router } from "express";
import {
  createCard,
  getProjectCards,
  getCard,
  updateCard,
  deleteCard,
  moveCard
} from "../controllers/card.controller.js"
import {
  createCardValidator,
  updateCardValidator,
  moveCardValidator
} from "../validators/card.validator.js"
import { validate } from "../middlewares/validate.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";
import { validatePermission } from "../middlewares/permission.middleware.js";

const router = Router();

router.route("/projects/:projectId/columns/:columnId/cards")
  .post(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(createCardValidator), createCard);

router.route("/projects/:projectId/cards")
  .get(verifyJWT, getProjectCards);

router.route("/projects/cards/:cardId")
  .get(verifyJWT, getCard)
  .patch(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(updateCardValidator), updateCard)
  .delete(verifyJWT, validatePermission(["ADMIN", "OWNER"]), deleteCard);

router.route("/project/cards/:cardId/move")
  .patch(verifyJWT, validatePermission(["ADMIN", "OWNER"]), validate(moveCardValidator), moveCard);

export default router;
