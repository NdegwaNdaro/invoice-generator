import { Eye, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const data = await api(`/customers?search=${encodeURIComponent(search)}`);
    setCustomers(data.customers);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  function openForm(customer) {
    setEditing(customer || null);
    setForm(customer ? { name: customer.name, email: customer.email || "", phone: customer.phone || "", address: customer.address || "" } : emptyForm);
    setShowForm(true);
    setMessage("");
  }

  async function save(event) {
    event.preventDefault();
    try {
      await api(editing ? `/customers/${editing.id}` : "/customers", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form)
      });
      setShowForm(false);
      setMessage(editing ? "Customer updated." : "Customer added.");
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function remove(customer) {
    if (!window.confirm(`Delete ${customer.name}?`)) return;
    try {
      await api(`/customers/${customer.id}`, { method: "DELETE" });
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow dark">RELATIONSHIPS</p><h1>Customers</h1><p>Manage the people and businesses you invoice.</p></div>
        <button className="button primary" onClick={() => openForm()}><Plus size={18} /> Add customer</button>
      </header>
      {message && <div className={`alert ${message.includes("updated") || message.includes("added") ? "success" : "error"}`}>{message}</div>}
      <section className="panel">
        <div className="toolbar">
          <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" /></label>
          <span>{customers.length} customer{customers.length === 1 ? "" : "s"}</span>
        </div>
        {customers.length ? (
          <div className="table-wrap"><table>
            <thead><tr><th>Customer</th><th>Contact</th><th>Address</th><th /></tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><div className="table-identity"><span><UserRound /></span><strong>{customer.name}</strong></div></td>
                  <td><strong>{customer.email || "—"}</strong><small>{customer.phone || ""}</small></td>
                  <td>{customer.address || "—"}</td>
                  <td className="table-actions"><button onClick={() => window.location.href = `/customers/${customer.id}/ledger`} title="Ledger"><Eye size={17} /></button><button onClick={() => openForm(customer)} title="Edit"><Pencil size={17} /></button><button onClick={() => remove(customer)} title="Delete"><Trash2 size={17} /></button></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        ) : <EmptyState title="No customers yet" description="Add your first customer to start creating invoices." action={<button className="button primary" onClick={() => openForm()}><Plus size={18} /> Add customer</button>} />}
      </section>
      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form className="modal" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
            <div className="panel-heading"><div><h2>{editing ? "Edit customer" : "Add customer"}</h2><p>Contact information shown on invoices.</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)}>×</button></div>
            <div className="form-grid">
              <label className="full">Customer or company name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <label>Phone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              <label className="full">Address<textarea rows="3" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
            </div>
            <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="button primary">Save customer</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
