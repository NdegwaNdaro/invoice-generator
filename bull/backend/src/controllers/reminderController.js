import { Invoice, Setting } from "../models/index.js";
import { sendOverdueReminderEmail } from "../services/emailService.js";

export async function sendOverdueInvoiceReminder(req, res) {
  const invoice = await Invoice.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [
      { association: "Customer" }
    ]
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
