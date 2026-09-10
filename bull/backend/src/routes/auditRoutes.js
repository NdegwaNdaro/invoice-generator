import { Router } from "express";
import { listPaymentAuditTrail } from "../controllers/auditController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { canAccessResource } from "../utils/roles.js";

const router = Router();

router.get("/payments", asyncHandler(async (req, res) => {
  if (!canAccessResource(req.user, "view_audit_logs")) {
    return res.status(403).json({ message: "You do not have permission to view payment audit logs." });
  }

  return listPaymentAuditTrail(req, res);
}));

export default router;
