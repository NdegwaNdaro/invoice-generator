import { Invoice, Payment } from "../models/index.js";
import { buildRevenueSummary } from "../utils/revenueReport.js";

export async function getRevenueReport(req, res) {
  const [invoices, payments] = await Promise.all([
    Invoice.findAll({ where: { userId: req.user.id } }),
    Payment.findAll({ where: { userId: req.user.id } })
  ]);

  const summary = buildRevenueSummary(invoices.map((invoice) => invoice.toJSON()), payments.map((payment) => payment.toJSON()));
  return res.json({ summary });
}
