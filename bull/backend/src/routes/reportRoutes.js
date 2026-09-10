import { Router } from "express";
import { getRevenueReport } from "../controllers/reportController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { canAccessResource } from "../utils/roles.js";

const router = Router();

router.get("/revenue", asyncHandler(async (req, res) => {
  if (!canAccessResource(req.user, "view_reports")) {
    return res.status(403).json({ message: "You do not have permission to view reports." });
  }

  return getRevenueReport(req, res);
}));

export default router;
