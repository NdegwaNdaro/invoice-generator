import { Payment, PaymentAuditLog } from "../models/index.js";

export async function listPaymentAuditTrail(req, res) {
  const logs = await PaymentAuditLog.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
    include: [{ model: Payment, attributes: ["id", "amount", "paymentDate", "method"] }]
  });

  return res.json({ auditTrail: logs });
}
