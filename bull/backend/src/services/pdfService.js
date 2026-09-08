import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const uploadsDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../uploads"
);

function money(value, currency) {
  return `${currency} ${Number(value).toLocaleString("en", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function createInvoicePdf(invoice, settings) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (settings.logo) {
      const logoPath = path.join(uploadsDirectory, path.basename(settings.logo));
      if (fs.existsSync(logoPath)) doc.image(logoPath, 48, 42, { fit: [80, 55] });
    }

    doc.fontSize(22).fillColor("#172554").text(settings.businessName || "Your Business", 150, 48, {
      align: "right"
    });
    doc.fontSize(10).fillColor("#475569");
    doc.text(settings.address || "", { align: "right" });
    doc.text([settings.email, settings.phone].filter(Boolean).join(" • "), { align: "right" });
    doc.moveDown(2);

    doc.fontSize(26).fillColor("#0f172a").text("INVOICE", 48, 125);
    doc.fontSize(10).fillColor("#475569");
    doc.text(`#${invoice.invoiceNumber}`, 48, 160);
    doc.text(`Invoice date: ${invoice.invoiceDate}`, 48, 177);
    doc.text(`Due date: ${invoice.dueDate || "On receipt"}`, 48, 194);

    doc.fontSize(10).fillColor("#64748b").text("BILL TO", 330, 135);
    doc.fontSize(13).fillColor("#0f172a").text(invoice.Customer.name, 330, 153);
    doc.fontSize(10).fillColor("#475569");
    doc.text(invoice.Customer.email || "", 330, 173);
    doc.text(invoice.Customer.phone || "", 330, 188);
    doc.text(invoice.Customer.address || "", 330, 203, { width: 215 });

    const tableTop = 255;
    doc.rect(48, tableTop, 499, 28).fill("#172554");
    doc.fillColor("#ffffff").fontSize(10);
    doc.text("Description", 58, tableTop + 9);
    doc.text("Qty", 330, tableTop + 9, { width: 45, align: "right" });
    doc.text("Rate", 385, tableTop + 9, { width: 70, align: "right" });
    doc.text("Amount", 465, tableTop + 9, { width: 72, align: "right" });

    let y = tableTop + 42;
    invoice.items.forEach((item, index) => {
      if (y > 690) {
        doc.addPage();
        y = 60;
      }
      if (index % 2 === 0) doc.rect(48, y - 7, 499, 25).fill("#f8fafc");
      doc.fillColor("#0f172a").fontSize(9);
      doc.text(item.description, 58, y, { width: 255 });
      doc.text(Number(item.quantity).toString(), 330, y, { width: 45, align: "right" });
      doc.text(money(item.rate, settings.currency), 385, y, { width: 70, align: "right" });
      doc.text(money(item.amount, settings.currency), 465, y, { width: 72, align: "right" });
      y += 28;
    });

    y = Math.max(y + 15, 390);
    const totals = [
      ["Subtotal", invoice.subtotal],
      [`Tax (${Number(invoice.taxRate)}%)`, invoice.tax],
      ["Discount", -Number(invoice.discount)],
      ["TOTAL", invoice.total]
    ];
    totals.forEach(([label, value], index) => {
      const isTotal = index === totals.length - 1;
      if (isTotal) doc.rect(330, y - 7, 217, 30).fill("#dbeafe");
      doc
        .fillColor(isTotal ? "#172554" : "#475569")
        .fontSize(isTotal ? 12 : 10)
        .text(label, 340, y, { width: 90 });
      doc.text(money(value, settings.currency), 430, y, { width: 107, align: "right" });
      y += isTotal ? 42 : 25;
    });

    doc.fontSize(10).fillColor("#64748b").text("Payment terms", 48, y);
    doc.fontSize(10).fillColor("#0f172a").text(settings.paymentTerms || "", 48, y + 17, {
      width: 450
    });
    if (invoice.notes) {
      doc.fillColor("#64748b").text("Notes", 48, y + 55);
      doc.fillColor("#0f172a").text(invoice.notes, 48, y + 72, { width: 450 });
    }

    doc.fontSize(9).fillColor("#94a3b8").text("Thank you for your business.", 48, 775, {
      align: "center",
      width: 499
    });
    doc.end();
  });
}
