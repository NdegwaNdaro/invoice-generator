import { Op } from "sequelize";
import { Customer, Invoice, Payment } from "../models/index.js";

export async function listPayments(req, res) {
  const where = { userId: req.user.id };
  if (req.query.invoiceId) where.invoiceId = req.query.invoiceId;
  if (req.query.customerId) where.customerId = req.query.customerId;
  if (req.query.search?.trim()) {
    where[Op.or] = [
      { "$Customer.name$": { [Op.like]: `%${req.query.search.trim()}%` } },
      { method: { [Op.like]: `%${req.query.search.trim()}%` } }
    ];
  }

  const payments = await Payment.findAll({
    where,
    include: [{ model: Customer, attributes: ["id", "name", "email"] }],
    order: [["paymentDate", "DESC"], ["id", "DESC"]]
  });

  res.json({ payments });
}

export async function createPayment(req, res) {
  const { invoiceId, customerId, amount, paymentDate, method, notes } = req.body;
  if (!invoiceId || !customerId || !amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "Invoice, customer, and a valid payment amount are required." });
  }

  const invoice = await Invoice.findOne({ where: { id: invoiceId, userId: req.user.id } });
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });

  const customer = await Customer.findOne({ where: { id: customerId, userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: "Customer not found." });

  const payment = await Payment.create({
    userId: req.user.id,
    invoiceId: invoice.id,
    customerId: customer.id,
    amount,
    paymentDate: paymentDate || new Date().toISOString().slice(0, 10),
    method: method || "bank_transfer",
    notes: notes?.trim() || ""
  });

  const totalPayments = await Payment.sum("amount", {
    where: { invoiceId: invoice.id, userId: req.user.id }
  });

  if (Number(totalPayments) >= Number(invoice.total)) {
    await invoice.update({ status: "paid" });
  } else if (invoice.status !== "overdue") {
    await invoice.update({ status: "sent" });
  }

  res.status(201).json({ payment });
}

export async function updatePayment(req, res) {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!payment) return res.status(404).json({ message: "Payment not found." });

  const { amount, paymentDate, method, notes } = req.body;
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: "A valid payment amount is required." });
  }

  await payment.update({
    amount,
    paymentDate: paymentDate || payment.paymentDate,
    method: method || payment.method,
    notes: notes?.trim() || payment.notes
  });

  const invoice = await Invoice.findOne({ where: { id: payment.invoiceId, userId: req.user.id } });
  if (invoice) {
    const totalPayments = await Payment.sum("amount", { where: { invoiceId: invoice.id, userId: req.user.id } });
    await invoice.update({
      status: Number(totalPayments) >= Number(invoice.total) ? "paid" : invoice.status
    });
  }

  res.json({ payment });
}

export async function deletePayment(req, res) {
  const payment = await Payment.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!payment) return res.status(404).json({ message: "Payment not found." });

  await payment.destroy();
  res.status(204).end();
}
