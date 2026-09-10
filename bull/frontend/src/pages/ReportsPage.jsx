import { BarChart3, CircleDollarSign, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function ReportsPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/reports/revenue")
      .then((response) => setSummary(response.summary))
      .catch((err) => setError(err.message));
  }, []);

  if (!summary) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow dark">REPORTS</p>
            <h1>Revenue summary</h1>
          </div>
        </div>
        <div className="panel">
          <p>{error || "Loading report…"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow dark">REPORTS</p>
          <h1>Revenue summary</h1>
          <p>Permission level: {user?.role || "manager"}</p>
        </div>
      </header>

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-icon blue"><BarChart3 /></span>
          <p>Total revenue</p>
          <strong>KES {Number(summary.totalRevenue).toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon green"><CircleDollarSign /></span>
          <p>Collected</p>
          <strong>KES {Number(summary.totalCollected).toLocaleString()}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber"><Clock3 /></span>
          <p>Outstanding</p>
          <strong>KES {Number(summary.outstanding).toLocaleString()}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Business snapshot</h2>
            <p>Invoice and payment totals for this account.</p>
          </div>
        </div>
        <div className="quick-grid">
          <div className="stat-card compact"><p>Invoice count</p><strong>{summary.invoiceCount}</strong></div>
          <div className="stat-card compact"><p>Payment count</p><strong>{summary.paymentCount}</strong></div>
          <div className="stat-card compact"><p>Overdue invoices</p><strong>{summary.overdueCount}</strong></div>
        </div>
      </section>
    </div>
  );
}
