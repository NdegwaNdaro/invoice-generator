import { Router } from "express";
import { sendOverdueInvoiceReminder } from "../controllers/reminderController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.post("/invoices/:id/remind", asyncHandler(sendOverdueInvoiceReminder));

export default router;
