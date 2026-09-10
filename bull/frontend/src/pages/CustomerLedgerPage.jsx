import { ArrowLeft, Banknote, CircleAlert, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";

export default function CustomerLedgerPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api(`/customers/${id}/ledger`).then((response) => setData(response));
  }, [id]);

  if (!data) return <div className="page-loader">Loading customer ledger…</div>;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link className="back-link" to="/customers"><ArrowLeft size={16} /> Back to customers</Link>
          <h1>{data.customer.name}</h1>
          <p>Ledger and balance activity for this customer.</p>
        </div>
      </header>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon blue"><Wallet /></span>
          <p>Total invoiced</p>
          <strong>KES {Number(data.summary.totalInvoiced).toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon green"><Banknote /></span>
          <p>Total paid</p>
          <strong>KES {Number(data.summary.totalPaid).toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber"><CircleAlert /></span>
          <p>Outstanding</p>
          <strong>KES {Number(data.summary.totalOutstanding).toLocaleString()}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Invoice ledger</h2>
            <p>Every invoice and its outstanding balance.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Due</th>
                <th>Status</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {data.summary.ledger.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.invoiceDate}</td>
                  <td>{invoice.dueDate || "On receipt"}</td>
                  <td><span className={`status status-${invoice.status}`}>{invoice.status}</span></td>
                  <td>KES {Number(invoice.total).toLocaleString()}</td>
                  <td>KES {Number(invoice.paidAmount).toLocaleString()}</td>
                  <td>KES {Number(invoice.outstanding).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
