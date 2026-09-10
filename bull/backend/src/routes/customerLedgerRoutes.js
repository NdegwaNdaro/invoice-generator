import { Router } from "express";
import { getCustomerLedger } from "../controllers/customerLedgerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/:id/ledger", asyncHandler(getCustomerLedger));

export default router;
