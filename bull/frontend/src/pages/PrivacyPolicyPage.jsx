import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page-shell">
      <div className="legal-card">
        <Link className="back-link" to="/">← Back to dashboard</Link>
        <span className="eyebrow dark">Privacy policy</span>
        <h1>Privacy Policy</h1>
        <p>
          AfriInvoice respects your privacy and handles your business information responsibly.
          This policy explains what data we collect, how we use it, and how we protect it.
        </p>

        <h2>Information we collect</h2>
        <p>
          We collect account information such as your name, email address, and password hash,
          customer and invoice records you enter into the system, and technical metadata needed
          to secure and operate the service.
        </p>

        <h2>How we use it</h2>
        <p>
          We use your data to create invoices, manage customer records, provide dashboard results,
          support business operations, and improve the reliability and security of the platform.
        </p>

        <h2>Data protection</h2>
        <p>
          We use secure transport, authentication, and role-based access controls. Passwords are
          hashed before storage, and access to sensitive records is limited to authorized users.
        </p>

        <h2>Sharing</h2>
        <p>
          We do not sell personal data. Information may be shared only with trusted service
          providers delivering hosting, email, or technical support when required to operate the
          service.
        </p>

        <h2>Retention</h2>
        <p>
          We retain records for as long as needed to provide the service, comply with legal
          obligations, resolve disputes, and maintain accurate business records.
        </p>

        <h2>Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by
          contacting the account owner or service administrator associated with your workspace.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact the support email associated with your account or the
          administrator of your AfriInvoice workspace.
        </p>
      </div>
    </div>
  );
}
