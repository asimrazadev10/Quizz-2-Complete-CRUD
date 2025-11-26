import express from "express";
const router = express.Router();
import { authenticate } from "../middleware/auth.js";
import ic from "../controllers/invoiceController.js";

import { body } from "express-validator";

router.post(
  "/create-invoice",
  authenticate,
  [
    body("subscriptionId").isMongoId(),
    body("amount").isFloat({ min: 0 }),
    body("invoiceDate").isISO8601().toDate(),
    body("source").isIn(["email", "upload", "api"]),
    body("status").isIn(["paid", "unpaid", "pending"]),
  ],
  ic.createInvoice
);
router.get(
  "/invoices/subscription/:subscriptionId",
  authenticate,
  ic.getInvoicesBySubscription
);
router.get("/invoice/:id", authenticate, ic.getInvoice);
router.put("/invoice/:id", authenticate, ic.updateInvoice);
router.delete("/invoice/:id", authenticate, ic.deleteInvoice);

export default router;
