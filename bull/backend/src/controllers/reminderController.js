import { Invoice, Setting } from "../models/index.js";
import { sendOverdueReminderEmail } from "../services/emailService.js";
import { canAccessResource } from "../utils/roles.js";

export async function sendOverdueInvoiceReminder(req, res) {
  if (!canAccessResource(req.user, "send_reminders")) {
    return res.status(403).json({ message: "You do not have permission to send reminders." });
  }

  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ association: "Customer" }]
  });

  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found." });
  }

  const recipient = req.body.email?.trim() || invoice.Customer?.email;
  if (!recipient) {
    return res.status(400).json({ message: "Recipient email is required." });
  }

  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  await sendOverdueReminderEmail({ invoice, settings, recipient });
  await invoice.update({ status: "overdue" });

  return res.json({ message: `Reminder sent to ${recipient}.` });
}

export async function runOverdueReminderScheduler(req, res) {
  if (!canAccessResource(req.user, "send_reminders")) {
    return res.status(403).json({ message: "You do not have permission to run the reminder scheduler." });
  }

  const overdueInvoices = await Invoice.findAll({
    where: { userId: req.user.id, status: "overdue" },
    include: [{ association: "Customer" }]
  });

  const [settings] = await Setting.findOrCreate({ where: { userId: req.user.id } });
  const sent = [];

  for (const invoice of overdueInvoices) {
    if (!invoice.Customer?.email) continue;
    await sendOverdueReminderEmail({ invoice, settings, recipient: invoice.Customer.email });
    sent.push(invoice.id);
  }

  return res.json({ sentCount: sent.length, invoices: sent });
}
