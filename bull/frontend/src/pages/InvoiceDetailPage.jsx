import { AlertCircle, ArrowLeft, Download, Mail, Pencil, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_URL } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState("");

  function load() {
    Promise.all([api(`/invoices/${id}`), api("/settings")]).then(([invoiceData, settingData]) => {
      setInvoice(invoiceData.invoice);
      setSettings(settingData.settings);
    });
  }
  useEffect(load, [id]);

  async function downloadPdf() {
    try {
      const blob = await api(`/invoices/${id}/pdf`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function sendEmail() {
    const email = window.prompt("Send invoice to:", invoice.Customer.email || "");
    if (!email) return;
    try {
      const data = await api(`/invoices/${id}/email`, {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setMessage(data.message);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function sendReminder() {
    const email = window.prompt("Send reminder to:", invoice.Customer.email || "");
    if (!email) return;
    try {
      const data = await api(`/reminders/invoices/${id}/remind`, {
        method: "POST",
        body: JSON.stringify({ email })
      });
      setMessage(data.message);
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function markPaid() {
    await api(`/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "paid" })
    });
    load();
  }

  if (!invoice || !settings) return <div className="page-loader">Loading invoice…</div>;
  const currency = settings.currency;

  return (
    <div className="page invoice-detail-page">
      <header className="page-header no-print">
        <div><Link className="back-link" to="/invoices"><ArrowLeft size={16} /> Back to invoices</Link><div className="title-with-status"><h1>{invoice.invoiceNumber}</h1><StatusBadge status={invoice.status} /></div><p>Created {invoice.invoiceDate} · Due {invoice.dueDate || "on receipt"}</p></div>
        <div className="header-actions"><Link className="button secondary" to={`/invoices/${id}/edit`}><Pencil size={17} /> Edit</Link><button className="button secondary" onClick={sendEmail}><Mail size={17} /> Email</button><button className="button secondary" onClick={sendReminder}><AlertCircle size={17} /> Reminder</button><button className="button secondary" onClick={downloadPdf}><Download size={17} /> PDF</button><button className="button primary" onClick={() => window.print()}><Printer size={17} /> Print</button></div>
      </header>
      {message && <div className={`alert no-print ${message.includes("sent") ? "success" : "error"}`}>{message}</div>}
      <article className="invoice-paper">
        <header className="invoice-paper-header">
          <div className="business-block">
            {settings.logo && <img src={`${API_URL.replace(/\/api$/, "")}${settings.logo}`} alt={`${settings.businessName} logo`} />}
            <div><h2>{settings.businessName}</h2><p>{settings.address}</p><p>{[settings.email, settings.phone].filter(Boolean).join(" · ")}</p></div>
          </div>
          <div className="invoice-heading"><span>INVOICE</span><strong>#{invoice.invoiceNumber}</strong></div>
        </header>
        <section className="invoice-meta">
          <div><span>BILL TO</span><h3>{invoice.Customer.name}</h3><p>{invoice.Customer.email}</p><p>{invoice.Customer.phone}</p><p>{invoice.Customer.address}</p></div>
          <dl><div><dt>Invoice date</dt><dd>{invoice.invoiceDate}</dd></div><div><dt>Due date</dt><dd>{invoice.dueDate || "On receipt"}</dd></div><div><dt>Status</dt><dd>{invoice.status}</dd></div></dl>
        </section>
        <table className="invoice-items"><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>{invoice.items.map((item) => <tr key={item.id}><td>{item.description}</td><td>{Number(item.quantity)}</td><td>{currency} {Number(item.rate).toLocaleString()}</td><td>{currency} {Number(item.amount).toLocaleString()}</td></tr>)}</tbody></table>
        <section className="invoice-bottom">
          <div><span>PAYMENT TERMS</span><p>{settings.paymentTerms}</p>{invoice.notes && <><span>NOTES</span><p>{invoice.notes}</p></>}</div>
          <dl className="invoice-totals"><div><dt>Subtotal</dt><dd>{currency} {Number(invoice.subtotal).toLocaleString()}</dd></div><div><dt>Tax ({Number(invoice.taxRate)}%)</dt><dd>{currency} {Number(invoice.tax).toLocaleString()}</dd></div><div><dt>Discount</dt><dd>− {currency} {Number(invoice.discount).toLocaleString()}</dd></div><div className="total"><dt>Total</dt><dd>{currency} {Number(invoice.total).toLocaleString()}</dd></div></dl>
        </section>
        <footer>Thank you for your business.</footer>
      </article>
      {invoice.status !== "paid" && <div className="invoice-followup no-print"><div><strong>Payment received?</strong><p>Keep your dashboard and revenue figures accurate.</p></div><button className="button success" onClick={markPaid}>Mark as paid</button></div>}
    </div>
  );
}
