import express from "express";
const router = express.Router();
import upc from "../controllers/userPlanController.js";
import { authenticate } from "../middleware/auth.js";
import { body } from "express-validator";

router.post(
  "/assign",
  authenticate,
  [
    body("userId").isMongoId(),
    body("planId").isMongoId(),
    body("stripeCustomerId").isString().notEmpty(),
    body("status")
      .isIn(["active", "canceled", "past_due", "incomplete"])
      .optional(),
  ],
  upc.assignPlanToUser
);
router.get("/plan/:userId", authenticate, upc.getUserPlan);
router.put("/plan/update/:userId", authenticate, upc.updateUserPlan);
router.put("/plan/:userId", authenticate, upc.cancelUserPlan);
router.delete("/plan/:userId", authenticate, upc.deleteUserPlan);

export default router;
