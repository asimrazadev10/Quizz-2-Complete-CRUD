import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.js";
import uc from "../controllers/userController.js";

router.get("/search", authenticate, uc.searchUsers);
router.get("/me", authenticate, uc.getMe);
router.put("/:username", authenticate, uc.updateUser);
router.get("/:username", authenticate, uc.getUserByUsername);

export default router;