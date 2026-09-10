import { ArrowDownCircle, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = {
  invoiceId: "",
  customerId: "",
  amount: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  method: "bank_transfer",
  notes: ""
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [paymentsData, invoiceData, customerData] = await Promise.all([
      api(`/payments?search=${encodeURIComponent(search)}`),
      api("/invoices"),
      api("/customers")
    ]);
    setPayments(paymentsData.payments);
    setInvoices(invoiceData.invoices);
    setCustomers(customerData.customers);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function save(event) {
    event.preventDefault();
    try {
      await api("/payments", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          customerId: Number(form.customerId),
          invoiceId: Number(form.invoiceId)
        })
      });
      setShowForm(false);
      setForm(emptyForm);
      setMessage("Payment recorded.");
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove(payment) {
    if (!window.confirm("Delete this payment record?")) return;
    await api(`/payments/${payment.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow dark">PAYMENTS</p>
          <h1>Payment tracking</h1>
          <p>Track customer payments and keep invoice balances accurate.</p>
        </div>
        <button className="button primary" onClick={() => setShowForm(true)}><Plus size={18} /> Record payment</button>
      </header>
      {message && <div className="alert success">{message}</div>}
      <section className="panel">
        <div className="toolbar">
          <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or method" /></label>
          <span>{payments.length} payment{payments.length === 1 ? "" : "s"}</span>
        </div>
        {payments.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td><strong>{payment.Customer?.name || "Customer"}</strong></td>
                    <td>{payment.invoiceId}</td>
                    <td>{payment.method}</td>
                    <td>{payment.paymentDate}</td>
                    <td><strong>KES {Number(payment.amount).toLocaleString()}</strong></td>
                    <td className="table-actions"><button onClick={() => remove(payment)} title="Delete"><Trash2 size={17} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No payments recorded yet" description="Add your first payment to keep balances up to date." action={<button className="button primary" onClick={() => setShowForm(true)}><ArrowDownCircle size={18} /> Record payment</button>} />}
      </section>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form className="modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div><h2>Record payment</h2><p>Log a payment against an invoice.</p></div>
              <button type="button" className="icon-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="form-grid">
              <label className="full">Customer
                <select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label className="full">Invoice
                <select required value={form.invoiceId} onChange={(event) => setForm({ ...form, invoiceId: event.target.value })}>
                  <option value="">Select invoice</option>
                  {invoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber}</option>)}
                </select>
              </label>
              <label>Amount<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
              <label>Payment date<input type="date" required value={form.paymentDate} onChange={(event) => setForm({ ...form, paymentDate: event.target.value })} /></label>
              <label>Method<select value={form.method} onChange={(event) => setForm({ ...form, method: event.target.value })}>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile money</option>
                <option value="card">Card</option>
              </select></label>
              <label className="full">Notes<textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="button primary">Save payment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
