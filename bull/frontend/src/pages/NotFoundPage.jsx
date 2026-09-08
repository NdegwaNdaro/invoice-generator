import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="legal-page-shell not-found-shell">
      <div className="legal-card not-found-card">
        <span className="eyebrow dark">404</span>
        <h1>Page not found</h1>
        <p>
          The page you are looking for might have moved, been removed, or never existed.
        </p>
        <div className="legal-actions">
          <Link className="button primary" to="/">Go home</Link>
          <Link className="button secondary" to="/login">Go to login</Link>
        </div>
      </div>
    </div>
  );
}
