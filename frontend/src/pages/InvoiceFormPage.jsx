import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

const today = new Date().toISOString().slice(0, 10);
const inThirtyDays = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const blankItem = { description: "", quantity: 1, rate: 0 };

export default function InvoiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [currency, setCurrency] = useState("KES");
  const [form, setForm] = useState({
    customerId: "",
    invoiceDate: today,
    dueDate: inThirtyDays,
    taxRate: 16,
    discount: 0,
    status: "draft",
    notes: "",
    items: [{ ...blankItem }]
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api("/customers"), api("/settings"), id ? api(`/invoices/${id}`) : null]).then(
      ([customerData, settingData, invoiceData]) => {
        setCustomers(customerData.customers);
        setCurrency(settingData.settings.currency);
        if (!id) {
          setForm((current) => ({ ...current, taxRate: Number(settingData.settings.taxRate) }));
        } else {
          const invoice = invoiceData.invoice;
          setForm({
            customerId: String(invoice.customerId),
            invoiceDate: invoice.invoiceDate,
            dueDate: invoice.dueDate || "",
            taxRate: Number(invoice.taxRate),
            discount: Number(invoice.discount),
            status: invoice.status,
            notes: invoice.notes || "",
            items: invoice.items.map((item) => ({
              description: item.description,
              quantity: Number(item.quantity),
              rate: Number(item.rate)
            }))
          });
        }
      }
    );
  }, [id]);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
      0
    );
    const tax = subtotal * (Number(form.taxRate || 0) / 100);
    return { subtotal, tax, total: Math.max(0, subtotal + tax - Number(form.discount || 0)) };
  }, [form]);

  function updateItem(index, key, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = await api(id ? `/invoices/${id}` : "/invoices", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      navigate(`/invoices/${data.invoice.id}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header compact">
        <div><Link className="back-link" to="/invoices"><ArrowLeft size={16} /> Back to invoices</Link><h1>{id ? "Edit invoice" : "Create invoice"}</h1><p>Add customer, dates, services, taxes, and payment details.</p></div>
      </header>
      {error && <div className="alert error">{error}</div>}
      {!customers.length && <div className="alert warning">Add a customer before creating an invoice. <Link to="/customers">Add customer</Link></div>}
      <form className="invoice-builder" onSubmit={submit}>
        <div className="builder-main">
          <section className="panel form-section">
            <div className="section-number">1</div><div className="section-content">
              <div className="panel-heading"><div><h2>Invoice details</h2><p>Choose who you are billing and when payment is due.</p></div></div>
              <div className="form-grid">
                <label className="full">Customer<select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}><option value="">Select a customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
                <label>Invoice date<input type="date" required value={form.invoiceDate} onChange={(event) => setForm({ ...form, invoiceDate: event.target.value })} /></label>
                <label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
                <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></label>
              </div>
            </div>
          </section>
          <section className="panel form-section">
            <div className="section-number">2</div><div className="section-content">
              <div className="panel-heading"><div><h2>Products and services</h2><p>Add every line item included in this invoice.</p></div><button type="button" className="button secondary small" onClick={() => setForm({ ...form, items: [...form.items, { ...blankItem }] })}><Plus size={16} /> Add item</button></div>
              <div className="items-table">
                <div className="item-row item-head"><span>Description</span><span>Quantity</span><span>Rate ({currency})</span><span>Amount</span><span /></div>
                {form.items.map((item, index) => (
                  <div className="item-row" key={index}>
                    <input required value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} placeholder="e.g. Website design" />
                    <input required min="0.01" step="0.01" type="number" value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                    <input required min="0" step="0.01" type="number" value={item.rate} onChange={(event) => updateItem(index, "rate", event.target.value)} />
                    <strong>{(Number(item.quantity || 0) * Number(item.rate || 0)).toLocaleString()}</strong>
                    <button type="button" disabled={form.items.length === 1} onClick={() => setForm({ ...form, items: form.items.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 size={17} /></button>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="panel form-section">
            <div className="section-number">3</div><div className="section-content">
              <div className="panel-heading"><div><h2>Tax and notes</h2><p>Apply tax or a discount and add invoice-specific notes.</p></div></div>
              <div className="form-grid">
                <label>Tax rate (%)<input type="number" min="0" step="0.01" value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: event.target.value })} /></label>
                <label>Discount ({currency})<input type="number" min="0" step="0.01" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} /></label>
                <label className="full">Notes<textarea rows="4" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Project details, bank information, or a thank-you note" /></label>
              </div>
            </div>
          </section>
        </div>
        <aside className="totals-card panel">
          <p className="eyebrow dark">INVOICE TOTAL</p>
          <div><span>Subtotal</span><strong>{currency} {totals.subtotal.toLocaleString()}</strong></div>
          <div><span>Tax ({Number(form.taxRate || 0)}%)</span><strong>{currency} {totals.tax.toLocaleString()}</strong></div>
          <div><span>Discount</span><strong>− {currency} {Number(form.discount || 0).toLocaleString()}</strong></div>
          <div className="grand-total"><span>Total</span><strong>{currency} {totals.total.toLocaleString()}</strong></div>
          <button className="button primary wide" disabled={saving || !customers.length}><Save size={18} /> {saving ? "Saving…" : "Save invoice"}</button>
          <Link className="button ghost wide" to="/invoices">Cancel</Link>
        </aside>
      </form>
    </div>
  );
}
