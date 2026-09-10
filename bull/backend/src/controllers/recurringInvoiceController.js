import { Op } from "sequelize";
import { Customer, RecurringInvoice } from "../models/index.js";

export async function listRecurringInvoices(req, res) {
  const where = { userId: req.user.id };
  if (req.query.search?.trim()) {
    where[Op.or] = [
      { title: { [Op.like]: `%${req.query.search.trim()}%` } },
      { "$Customer.name$": { [Op.like]: `%${req.query.search.trim()}%` } }
    ];
  }

  const recurringInvoices = await RecurringInvoice.findAll({
    where,
    include: [{ model: Customer, attributes: ["id", "name", "email"] }],
    order: [["nextRunDate", "ASC"], ["id", "DESC"]]
  });

  res.json({ recurringInvoices });
}

export async function createRecurringInvoice(req, res) {
  const { customerId, title, amount, frequency, nextRunDate, status, notes } = req.body;
  if (!customerId || !title?.trim() || !amount || Number(amount) <= 0 || !nextRunDate) {
    return res.status(400).json({ message: "Customer, title, amount, and next run date are required." });
  }

  const customer = await Customer.findOne({ where: { id: customerId, userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: "Customer not found." });

  const recurring = await RecurringInvoice.create({
    userId: req.user.id,
    customerId: customer.id,
    title: title.trim(),
    description: req.body.description?.trim() || "",
    amount,
    frequency: frequency || "monthly",
    nextRunDate,
    status: status || "active",
    notes: notes?.trim() || ""
  });

  res.status(201).json({ recurringInvoice: recurring });
}

export async function updateRecurringInvoice(req, res) {
  const recurring = await RecurringInvoice.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!recurring) return res.status(404).json({ message: "Recurring invoice not found." });

  const { customerId, title, amount, frequency, nextRunDate, status, notes } = req.body;
  if (!customerId || !title?.trim() || !amount || Number(amount) <= 0 || !nextRunDate) {
    return res.status(400).json({ message: "Customer, title, amount, and next run date are required." });
  }

  const customer = await Customer.findOne({ where: { id: customerId, userId: req.user.id } });
  if (!customer) return res.status(404).json({ message: "Customer not found." });

  await recurring.update({
    customerId: customer.id,
    title: title.trim(),
    description: req.body.description?.trim() || "",
    amount,
    frequency: frequency || recurring.frequency,
    nextRunDate,
    status: status || recurring.status,
    notes: notes?.trim() || ""
  });

  res.json({ recurringInvoice: recurring });
}

export async function deleteRecurringInvoice(req, res) {
  const recurring = await RecurringInvoice.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!recurring) return res.status(404).json({ message: "Recurring invoice not found." });

  await recurring.destroy();
  res.status(204).end();
}
