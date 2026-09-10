import { Customer, Invoice, Payment } from "../models/index.js";
import { summarizeCustomerLedger } from "../utils/customerLedger.js";

export async function getCustomerLedger(req, res) {
  const customer = await Customer.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });

  if (!customer) {
    return res.status(404).json({ message: "Customer not found." });
  }

  const [invoices, payments] = await Promise.all([
    Invoice.findAll({
      where: { userId: req.user.id, customerId: customer.id },
      order: [["invoiceDate", "DESC"], ["id", "DESC"]]
    }),
    Payment.findAll({
      where: { userId: req.user.id, customerId: customer.id },
      order: [["paymentDate", "DESC"], ["id", "DESC"]]
    })
  ]);

  const summary = summarizeCustomerLedger(invoices, payments);
  return res.json({ customer, summary });
}
