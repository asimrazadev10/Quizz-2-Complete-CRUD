import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.js";
import ac from "../controllers/alertController.js";
import { body } from "express-validator";

// FIX: Change /create-alert to /
router.post(
  "/",
  authenticate,
  [
    body("subscriptionId")
      .notEmpty()
      .withMessage("Subscription ID is required"),
    body("type")
      .notEmpty()
      .isIn(["renewal", "budget", "invoice-missing"])
      .withMessage("Alert type is required"),
  ],
  ac.createAlert
);

// FIX: Remove /alerts prefix
router.get("/subscription/:subscriptionId", authenticate, ac.getAlertsBySubscription);

// FIX: Remove /alert prefix
router.get("/:id", authenticate, ac.getAlert);
router.put("/:id", authenticate, ac.updateAlert);
router.delete("/:id", authenticate, ac.deleteAlert);

export default router;
