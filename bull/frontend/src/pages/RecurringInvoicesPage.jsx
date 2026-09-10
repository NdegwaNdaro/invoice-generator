import { Pencil, Plus, Repeat2, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = {
  customerId: "",
  title: "",
  description: "",
  amount: "",
  frequency: "monthly",
  nextRunDate: new Date().toISOString().slice(0, 10),
  status: "active",
  notes: ""
};

export default function RecurringInvoicesPage() {
  const [recurring, setRecurring] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [recurringData, customerData] = await Promise.all([
      api(`/recurring-invoices?search=${encodeURIComponent(search)}`),
      api("/customers")
    ]);
    setRecurring(recurringData.recurringInvoices);
    setCustomers(customerData.customers);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  function openForm(item) {
    setEditing(item || null);
    setForm(item ? {
      customerId: String(item.customerId),
      title: item.title,
      description: item.description || "",
      amount: Number(item.amount),
      frequency: item.frequency,
      nextRunDate: item.nextRunDate,
      status: item.status,
      notes: item.notes || ""
    } : emptyForm);
    setShowForm(true);
    setMessage("");
  }

  async function save(event) {
    event.preventDefault();
    try {
      await api(editing ? `/recurring-invoices/${editing.id}` : "/recurring-invoices", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          customerId: Number(form.customerId)
        })
      });
      setShowForm(false);
      setMessage(editing ? "Recurring invoice updated." : "Recurring invoice created.");
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete recurring invoice ${item.title}?`)) return;
    await api(`/recurring-invoices/${item.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow dark">RECURRING</p>
          <h1>Recurring invoices</h1>
          <p>Plan repeat billing for ongoing services and subscriptions.</p>
        </div>
        <button className="button primary" onClick={() => openForm()}><Plus size={18} /> New recurring</button>
      </header>
      {message && <div className={`alert ${message.includes("updated") || message.includes("created") ? "success" : "error"}`}>{message}</div>}
      <section className="panel">
        <div className="toolbar">
          <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recurring invoice or customer" /></label>
          <span>{recurring.length} recurring invoice{recurring.length === 1 ? "" : "s"}</span>
        </div>
        {recurring.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Frequency</th>
                  <th>Next date</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recurring.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.Customer?.name || "Customer"}</td>
                    <td>{item.frequency}</td>
                    <td>{item.nextRunDate}</td>
                    <td><strong>KES {Number(item.amount).toLocaleString()}</strong></td>
                    <td className="table-actions">
                      <button onClick={() => openForm(item)} title="Edit"><Pencil size={17} /></button>
                      <button onClick={() => remove(item)} title="Delete"><Trash2 size={17} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No recurring invoices" description="Set up repeat billing for recurring services." action={<button className="button primary" onClick={() => openForm()}><Repeat2 size={18} /> Add recurring</button>} />}
      </section>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form className="modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-heading">
              <div><h2>{editing ? "Edit recurring invoice" : "Create recurring invoice"}</h2><p>Automate repeat billing for ongoing services.</p></div>
              <button type="button" className="icon-button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="form-grid">
              <label className="full">Customer
                <select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </label>
              <label className="full">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>Amount<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
              <label>Frequency<select value={form.frequency} onChange={(event) => setForm({ ...form, frequency: event.target.value })}><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></label>
              <label>Next run date<input type="date" required value={form.nextRunDate} onChange={(event) => setForm({ ...form, nextRunDate: event.target.value })} /></label>
              <label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Active</option><option value="paused">Paused</option></select></label>
              <label className="full">Description<textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <label className="full">Notes<textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="button primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
