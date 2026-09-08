import { Building2, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { api, API_URL } from "../api.js";

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api("/settings").then((data) => {
      setForm(data.settings);
      setCurrencies(data.currencies);
    });
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      const data = await api("/settings", { method: "PUT", body: JSON.stringify(form) });
      setForm(data.settings);
      setMessage("Settings saved.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const body = new FormData();
    body.append("logo", file);
    try {
      const data = await api("/settings/logo", { method: "POST", body });
      setForm(data.settings);
      setMessage("Logo uploaded.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (!form) return <div className="page-loader">Loading settings…</div>;
  const assetUrl = API_URL.replace(/\/api$/, "");

  return (
    <div className="page">
      <header className="page-header"><div><p className="eyebrow dark">WORKSPACE</p><h1>Business settings</h1><p>Control the details, branding, currency, and tax used on invoices.</p></div></header>
      {message && <div className={`alert ${message.includes("saved") || message.includes("uploaded") ? "success" : "error"}`}>{message}</div>}
      <form className="settings-grid" onSubmit={save}>
        <section className="panel settings-logo">
          <span className="settings-icon"><Building2 /></span><h2>Business logo</h2><p>PNG, JPEG, or WebP up to 2 MB.</p>
          <div className="logo-preview">{form.logo ? <img src={`${assetUrl}${form.logo}`} alt="Business logo" /> : <span>{form.businessName?.charAt(0) || "B"}</span>}</div>
          <label className="button secondary upload-button"><Upload size={17} /> Upload logo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} /></label>
        </section>
        <section className="panel settings-form">
          <div className="panel-heading"><div><h2>Business information</h2><p>This information appears at the top of every invoice.</p></div></div>
          <div className="form-grid">
            <label className="full">Business name<input required value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} /></label>
            <label>Business email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <label>Phone number<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
            <label className="full">Address<textarea rows="3" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
          </div>
          <hr />
          <div className="panel-heading"><div><h2>Invoice defaults</h2><p>Pre-fill new invoices with your usual preferences.</p></div></div>
          <div className="form-grid">
            <label>Currency<select value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>{currencies.map((currency) => <option key={currency}>{currency}</option>)}</select></label>
            <label>Default tax / VAT (%)<input type="number" min="0" step="0.01" value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: event.target.value })} /></label>
            <label className="full">Payment terms<textarea rows="4" value={form.paymentTerms} onChange={(event) => setForm({ ...form, paymentTerms: event.target.value })} /></label>
          </div>
          <div className="form-actions"><button className="button primary"><Save size={18} /> Save settings</button></div>
        </section>
      </form>
    </div>
  );
}
