import { Op } from "sequelize";
import { Customer, Invoice } from "../models/index.js";

export async function listCustomers(req, res) {
  const search = req.query.search?.trim();
  const where = { userId: req.user.id };
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } }
    ];
  }
  const customers = await Customer.findAll({ where, order: [["name", "ASC"]] });
  res.json({ customers });
}

export async function createCustomer(req, res) {
  if (!req.body.name?.trim()) {
    return res.status(400).json({ message: "Customer name is required." });
  }
  const customer = await Customer.create({
    userId: req.user.id,
    name: req.body.name.trim(),
    email: req.body.email?.trim() || null,
    phone: req.body.phone?.trim() || null,
    address: req.body.address?.trim() || null
  });
  return res.status(201).json({ customer });
}

export async function updateCustomer(req, res) {
  const customer = await Customer.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!customer) return res.status(404).json({ message: "Customer not found." });
  if (!req.body.name?.trim()) {
    return res.status(400).json({ message: "Customer name is required." });
  }

  await customer.update({
    name: req.body.name.trim(),
    email: req.body.email?.trim() || null,
    phone: req.body.phone?.trim() || null,
    address: req.body.address?.trim() || null
  });
  return res.json({ customer });
}

export async function deleteCustomer(req, res) {
  const customer = await Customer.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!customer) return res.status(404).json({ message: "Customer not found." });
  if (await Invoice.count({ where: { customerId: customer.id } })) {
    return res.status(409).json({ message: "Customers with invoices cannot be deleted." });
  }
  await customer.destroy();
  return res.status(204).end();
}
