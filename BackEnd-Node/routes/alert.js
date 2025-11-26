import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.js";
import ac from "../controllers/alertController.js";

import { body } from "express-validator";

router.post(
  "/create-alert",
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
router.get(
  "/alerts/subscription/:subscriptionId",
  authenticate,
  ac.getAlertsBySubscription
);
router.get("/alert/:id", authenticate, ac.getAlert);
router.put("/alert/:id", authenticate, ac.updateAlert);
router.delete("/alert/:id", authenticate, ac.deleteAlert);

export default router;
