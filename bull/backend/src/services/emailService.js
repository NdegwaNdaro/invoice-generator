import nodemailer from "nodemailer";

function mailTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    const error = new Error("SMTP is not configured on this server.");
    error.status = 503;
    throw error;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

export async function sendInvoiceEmail({ invoice, settings, recipient, pdf }) {
  await mailTransport().sendMail({
    from: process.env.SMTP_FROM || settings.email || process.env.SMTP_USER,
    to: recipient,
    subject: `Invoice ${invoice.invoiceNumber} from ${settings.businessName}`,
    text: `Hello ${invoice.Customer.name},\n\nPlease find invoice ${invoice.invoiceNumber} attached. The total is ${settings.currency} ${Number(invoice.total).toFixed(2)} and it is due ${invoice.dueDate || "on receipt"}.\n\n${settings.paymentTerms}\n`,
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdf,
        contentType: "application/pdf"
      }
    ]
  });
}
