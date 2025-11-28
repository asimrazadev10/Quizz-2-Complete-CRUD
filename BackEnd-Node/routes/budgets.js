import express from "express";
const router = express.Router();
import bc from "../controllers/budgetController.js";
import { authenticate } from "../middleware/auth.js";
import { body } from "express-validator";

router.get("/:workspaceId", authenticate, bc.getBudgetByWorkspace);

router.put(
  "/:budgetId",
  authenticate,
  [
    body("monthlyCap").isNumeric().withMessage("monthlyCap must be a number"),
    body("alertThreshold")
    .isNumeric()
    .withMessage("alertThreshold must be a number"),
  ],
  bc.updateBudget
);

export default router;
