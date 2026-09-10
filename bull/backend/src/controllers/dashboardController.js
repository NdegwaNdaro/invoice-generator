import { fn, col } from "sequelize";
import { Customer, Invoice, Payment, RecurringInvoice } from "../models/index.js";

export async function dashboardSummary(req, res) {
  const base = { userId: req.user.id };
  const [totalInvoices, paidInvoices, pendingInvoices, customers, revenue, outstanding, recurringCount] = await Promise.all([
    Invoice.count({ where: base }),
    Invoice.count({ where: { ...base, status: "paid" } }),
    Invoice.count({ where: { ...base, status: ["draft", "sent", "overdue"] } }),
    Customer.count({ where: base }),
    Invoice.findOne({
      where: { ...base, status: "paid" },
      attributes: [[fn("COALESCE", fn("SUM", col("total")), 0), "total"]]
    }),
    Invoice.findOne({
      where: { ...base, status: ["draft", "sent", "overdue"] },
      attributes: [[fn("COALESCE", fn("SUM", col("total")), 0), "total"]]
    }),
    RecurringInvoice.count({ where: base })
  ]);

  const totalPayments = await Payment.sum("amount", { where: base });

  res.json({
    summary: {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      customers,
      totalRevenue: Number(revenue?.get("total") || 0),
      outstandingBalance: Number(outstanding?.get("total") || 0),
      totalPayments: Number(totalPayments || 0),
      recurringInvoices: recurringCount
    }
  });
}
