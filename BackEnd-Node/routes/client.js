import express from "express";
const router = express.Router();
import cc from "../controllers/clientController.js";
import { authenticate } from "../middleware/auth.js";
import { body } from "express-validator";

router.post(
  "/subscribe",
  authenticate,
  [
    body("workspaceId").notEmpty().withMessage("Workspace ID is required"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  cc.createClient
);
router.get("/workspace/:workspaceId", authenticate, cc.getClientsByWorkspace);
router.get("/:id", authenticate, cc.getClient);
router.delete("/:id", authenticate, cc.deleteClient);

export default router;
