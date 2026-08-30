import { Op } from "sequelize";
import {
  Customer,
  Invoice,
  InvoiceItem,
  Setting,
  sequelize
} from "../models/index.js";
import { sendInvoiceEmail } from "../services/emailService.js";
import { createInvoicePdf } from "../services/pdfService.js";
import { calculateInvoice, validateInvoiceInput } from "../utils/invoice.js";

const include = [
  { model: Customer, attributes: ["id", "name", "email", "phone", "address"] },
  { model: InvoiceItem, as: "items" }
];

async function findInvoice(id, userId) {
  return Invoice.findOne({ where: { id, userId }, include });
}

async function nextInvoiceNumber(userId) {
  const latest = await Invoice.findOne({
    where: { userId },
    order: [["id", "DESC"]],
    attributes: ["invoiceNumber"]
  });
  const value = Number(latest?.invoiceNumber?.match(/(\d+)$/)?.[1] || 0) + 1;
  return `INV-${String(value).padStart(4, "0")}`;
}

export async function listInvoices(req, res) {
  const where = { userId: req.user.id };
  if (req.query.status && req.query.status !== "all") where.status = req.query.status;
  if (req.query.search?.trim()) {
    where[Op.or] = [
      { invoiceNumber: { [Op.like]: `%${req.query.search.trim()}%` } },
      { "$Customer.name$": { [Op.like]: `%${req.query.search.trim()}%` } }
    ];
  }
  const invoices = await Invoice.findAll({
    where,
    include,
    order: [["invoiceDate", "DESC"], ["id", "DESC"]],
    subQuery: false
  });
  res.json({ invoices });
}

export async function getInvoice(req, res) {
  const invoice = await findInvoice(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  return res.json({ invoice });
}

export async function createInvoice(req, res) {
  const validationError = validateInvoiceInput(req.body);
  if (validationError) return res.status(400).json({ message: validationError });
  const customer = await Customer.findOne({
    where: { id: req.body.customerId, userId: req.user.id }
  });
  if (!customer) return res.status(404).json({ message: "Customer not found." });
  const totals = calculateInvoice(req.body.items, req.body.taxRate, req.body.discount);

  const createdId = await sequelize.transaction(async (transaction) => {
    const invoice = await Invoice.create(
      {
        userId: req.user.id,
        customerId: customer.id,
        invoiceNumber: await nextInvoiceNumber(req.user.id),
        invoiceDate: req.body.invoiceDate,
        dueDate: req.body.dueDate || null,
        status: req.body.status || "draft",
        notes: req.body.notes?.trim() || "",
        ...totals
      },
      { transaction }
    );
    await InvoiceItem.bulkCreate(
      totals.items.map((item) => ({ ...item, invoiceId: invoice.id })),
      { transaction }
    );
    return invoice.id;
  });

  return res.status(201).json({ invoice: await findInvoice(createdId, req.user.id) });
}

export async function updateInvoice(req, res) {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  const validationError = validateInvoiceInput(req.body);
  if (validationError) return res.status(400).json({ message: validationError });
  const customer = await Customer.findOne({
    where: { id: req.body.customerId, userId: req.user.id }
  });
  if (!customer) return res.status(404).json({ message: "Customer not found." });
  const totals = calculateInvoice(req.body.items, req.body.taxRate, req.body.discount);

  await sequelize.transaction(async (transaction) => {
    await invoice.update(
      {
        customerId: customer.id,
        invoiceDate: req.body.invoiceDate,
        dueDate: req.body.dueDate || null,
        status: req.body.status || invoice.status,
        notes: req.body.notes?.trim() || "",
        ...totals
      },
      { transaction }
    );
    await InvoiceItem.destroy({ where: { invoiceId: invoice.id }, transaction });
    await InvoiceItem.bulkCreate(
      totals.items.map((item) => ({ ...item, invoiceId: invoice.id })),
      { transaction }
    );
  });
  return res.json({ invoice: await findInvoice(invoice.id, req.user.id) });
}

export async function updateInvoiceStatus(req, res) {
  const allowed = ["draft", "sent", "paid", "overdue"];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid invoice status." });
  }
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  await invoice.update({ status: req.body.status });
  return res.json({ invoice });
}

export async function deleteInvoice(req, res) {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  await invoice.destroy();
  return res.status(204).end();
}

export async function downloadInvoicePdf(req, res) {
  const invoice = await findInvoice(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  const pdf = await createInvoicePdf(invoice, settings);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`
  });
  return res.send(pdf);
}

export async function emailInvoice(req, res) {
  const invoice = await findInvoice(req.params.id, req.user.id);
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  const recipient = req.body.email?.trim() || invoice.Customer.email;
  if (!recipient) return res.status(400).json({ message: "Recipient email is required." });
  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  const pdf = await createInvoicePdf(invoice, settings);
  await sendInvoiceEmail({ invoice, settings, recipient, pdf });
  if (invoice.status === "draft") await invoice.update({ status: "sent" });
  return res.json({ message: `Invoice sent to ${recipient}.` });
}
