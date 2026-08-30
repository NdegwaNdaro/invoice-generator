import { Router } from "express";
import authRoutes from "./authRoutes.js";
import customerRoutes from "./customerRoutes.js";
import invoiceRoutes from "./invoiceRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import { dashboardSummary } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use("/auth", authRoutes);
router.use(requireAuth);
router.get("/dashboard", asyncHandler(dashboardSummary));
router.use("/customers", customerRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/settings", settingsRoutes);
export default router;
