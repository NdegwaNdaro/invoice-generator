import {
  ArrowDownCircle,
  FilePlus2,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Repeat2,
  ScrollText,
  Settings,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/invoices", label: "Invoices", icon: Files },
  { to: "/invoices/new", label: "Create invoice", icon: FilePlus2 },
  { to: "/payments", label: "Payments", icon: ArrowDownCircle },
  { to: "/audit", label: "Audit trail", icon: ScrollText },
  { to: "/recurring-invoices", label: "Recurring", icon: Repeat2 },
  { to: "/reports", label: "Reports", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">A</span>
          <div><strong>AfriInvoice</strong><small>Business made simple</small></div>
          <button className="icon-button mobile-only" onClick={() => setOpen(false)}><X /></button>
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.roleDescription || user?.role || "Business owner"}</small>
            <small>{user?.email}</small>
          </div>
          <button className="icon-button" title="Log out" onClick={logout}><LogOut size={18} /></button>
        </div>
      </aside>
      {open && <button className="backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <main className="main-content">
        <button className="menu-button mobile-only" onClick={() => setOpen(true)}><Menu /></button>
        <Outlet />
      </main>
    </div>
  );
}
