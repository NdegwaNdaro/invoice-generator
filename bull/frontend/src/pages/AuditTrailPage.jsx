import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function AuditTrailPage() {
  const [auditTrail, setAuditTrail] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/audit/payments")
      .then((data) => setAuditTrail(data.auditTrail))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow dark">AUDIT</p>
          <h1>Payment audit trail</h1>
          <p>Track who touched payment records and what changed.</p>
        </div>
      </header>

      {error ? <div className="alert error">{error}</div> : null}

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.length ? auditTrail.map((entry) => (
                <tr key={entry.id}>
                  <td><span className="status status-sent"><ShieldCheck size={14} /> {entry.action}</span></td>
                  <td>#{entry.paymentId}</td>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>{entry.oldValues ? `Updated from ${entry.oldValues.amount ?? "—"} to ${entry.newValues?.amount ?? "—"}` : `Created for ${entry.newValues?.amount ?? "—"}`}</td>
                </tr>
              )) : (
                <tr><td colSpan="4">No audit history recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
