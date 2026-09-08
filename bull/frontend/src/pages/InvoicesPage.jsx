import { Eye, FilePlus2, Pencil, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currency, setCurrency] = useState("KES");

  const load = useCallback(async () => {
    const query = new URLSearchParams({ search, status });
    const [invoiceData, settingData] = await Promise.all([
      api(`/invoices?${query}`),
      api("/settings")
    ]);
    setInvoices(invoiceData.invoices);
    setCurrency(settingData.settings.currency);
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  async function remove(invoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    await api(`/invoices/${invoice.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow dark">BILLING</p><h1>Invoices</h1><p>Track every invoice from draft to paid.</p></div>
        <Link className="button primary" to="/invoices/new"><FilePlus2 size={18} /> Create invoice</Link>
      </header>
      <section className="panel">
        <div className="toolbar">
          <label className="search-field"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoice or customer" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option><option value="overdue">Overdue</option>
          </select>
        </div>
        {invoices.length ? (
          <div className="table-wrap"><table>
            <thead><tr><th>Invoice</th><th>Customer</th><th>Issued / Due</th><th>Total</th><th>Status</th><th /></tr></thead>
            <tbody>{invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td><Link className="invoice-link" to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link></td>
                <td><strong>{invoice.Customer.name}</strong><small>{invoice.Customer.email}</small></td>
                <td>{invoice.invoiceDate}<small>Due {invoice.dueDate || "on receipt"}</small></td>
                <td><strong>{currency} {Number(invoice.total).toLocaleString()}</strong></td>
                <td><StatusBadge status={invoice.status} /></td>
                <td className="table-actions"><Link to={`/invoices/${invoice.id}`} title="View"><Eye size={17} /></Link><Link to={`/invoices/${invoice.id}/edit`} title="Edit"><Pencil size={17} /></Link><button onClick={() => remove(invoice)} title="Delete"><Trash2 size={17} /></button></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <EmptyState title="No invoices found" description="Create an invoice or adjust your filters." action={<Link className="button primary" to="/invoices/new"><FilePlus2 size={18} /> Create invoice</Link>} />}
      </section>
    </div>
  );
}
