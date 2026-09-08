import { CircleDollarSign, Clock3, FileText, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [currency, setCurrency] = useState("KES");

  useEffect(() => {
    Promise.all([api("/dashboard"), api("/settings")]).then(([dashboard, settings]) => {
      setSummary(dashboard.summary);
      setCurrency(settings.settings.currency);
    });
  }, []);

  const cards = [
    { label: "Total invoices", value: summary?.totalInvoices || 0, icon: FileText, tone: "blue" },
    { label: "Paid invoices", value: summary?.paidInvoices || 0, icon: CircleDollarSign, tone: "green" },
    { label: "Pending invoices", value: summary?.pendingInvoices || 0, icon: Clock3, tone: "amber" },
    { label: "Customers", value: summary?.customers || 0, icon: Users, tone: "purple" }
  ];

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow dark">OVERVIEW</p><h1>Good day, {user?.name?.split(" ")[0]}</h1><p>Here is how your business is doing.</p></div>
        <Link className="button primary" to="/invoices/new"><Plus size={18} /> Create invoice</Link>
      </header>
      <section className="stat-grid">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className="stat-card" key={label}>
            <span className={`stat-icon ${tone}`}><Icon /></span>
            <p>{label}</p><strong>{value}</strong>
          </article>
        ))}
      </section>
      <section className="revenue-card">
        <div><p className="eyebrow">PAID REVENUE</p><h2>{currency} {Number(summary?.totalRevenue || 0).toLocaleString()}</h2><p>Total value of invoices marked as paid.</p></div>
        <div className="revenue-art"><span /><span /><span /><span /><span /></div>
      </section>
      <section className="quick-grid">
        <article className="panel">
          <div className="panel-heading"><div><h2>Quick start</h2><p>Keep your business moving.</p></div></div>
          <div className="quick-actions">
            <Link to="/invoices/new"><FileText /><span><strong>Create an invoice</strong><small>Add services, taxes, and due dates</small></span></Link>
            <Link to="/customers"><Users /><span><strong>Add a customer</strong><small>Build your customer directory</small></span></Link>
          </div>
        </article>
        <article className="panel tip-card">
          <span className="tip-label">BUSINESS TIP</span>
          <h2>Get paid on time</h2>
          <p>Set clear payment terms and send invoices promptly. Use the status tracker to follow up on overdue payments.</p>
          <Link to="/settings">Configure payment terms →</Link>
        </article>
      </section>
    </div>
  );
}
