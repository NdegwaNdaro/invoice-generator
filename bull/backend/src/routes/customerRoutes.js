import { Router } from "express";
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer
} from "../controllers/customerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(listCustomers));
router.post("/", asyncHandler(createCustomer));
router.put("/:id", asyncHandler(updateCustomer));
router.delete("/:id", asyncHandler(deleteCustomer));
export default router;
