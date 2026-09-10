import { Router } from "express";
import {
  createPayment,
  deletePayment,
  listPayments,
  updatePayment
} from "../controllers/paymentController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(listPayments));
router.post("/", asyncHandler(createPayment));
router.put("/:id", asyncHandler(updatePayment));
router.delete("/:id", asyncHandler(deletePayment));

export default router;
