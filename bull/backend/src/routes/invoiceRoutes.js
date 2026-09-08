import { Router } from "express";
import {
  createInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  emailInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  updateInvoiceStatus
} from "../controllers/invoiceController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(listInvoices));
router.post("/", asyncHandler(createInvoice));
router.get("/:id", asyncHandler(getInvoice));
router.put("/:id", asyncHandler(updateInvoice));
router.delete("/:id", asyncHandler(deleteInvoice));
router.patch("/:id/status", asyncHandler(updateInvoiceStatus));
router.get("/:id/pdf", asyncHandler(downloadInvoicePdf));
router.post("/:id/email", asyncHandler(emailInvoice));
export default router;
