import { Router } from "express";
import {
  createRecurringInvoice,
  deleteRecurringInvoice,
  listRecurringInvoices,
  updateRecurringInvoice
} from "../controllers/recurringInvoiceController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(listRecurringInvoices));
router.post("/", asyncHandler(createRecurringInvoice));
router.put("/:id", asyncHandler(updateRecurringInvoice));
router.delete("/:id", asyncHandler(deleteRecurringInvoice));

export default router;
