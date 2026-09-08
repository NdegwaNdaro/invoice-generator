import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="legal-page-shell">
      <div className="legal-card">
        <Link className="back-link" to="/">← Back to dashboard</Link>
        <span className="eyebrow dark">Terms and conditions</span>
        <h1>Terms and Conditions</h1>
        <p>
          These Terms and Conditions govern use of AfriInvoice and related services. By using the
          service, you agree to the terms below.
        </p>

        <h2>Service scope</h2>
        <p>
          AfriInvoice provides invoice creation, customer management, business settings, and
          reporting tools for business and personal use. The service is offered “as is” and may be
          updated or modified over time.
        </p>

        <h2>User responsibilities</h2>
        <p>
          You are responsible for the accuracy of your account information, customer records, and
          invoice content. You must not use the service for unlawful activity, fraud, or abusive
          conduct toward others.
        </p>

        <h2>Payments and billing</h2>
        <p>
          If you subscribe to paid features, all charges are due according to the plan selected. We
          reserve the right to suspend or terminate access for overdue or abusive use.
        </p>

        <h2>Intellectual property</h2>
        <p>
          The platform, branding, and software are owned by AfriInvoice or its licensors. You retain
          ownership of the data you upload or generate, but you grant us the necessary rights to
          process it for service delivery.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          We are not liable for indirect, incidental, or consequential damages arising from use of
          the service, including lost revenue, missed payments, or business disruption caused by
          external factors beyond our reasonable control.
        </p>

        <h2>Termination</h2>
        <p>
          We may suspend or terminate access if you violate these Terms, misuse the service, or fail
          to maintain compliance with applicable laws.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these Terms periodically. Continued use of the service after updates means
          you accept the modified version.
        </p>
      </div>
    </div>
  );
}
