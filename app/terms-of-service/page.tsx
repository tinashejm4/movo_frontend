import type { Metadata } from "next";
import Link from "next/link";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "Terms & Conditions | MOVO",
  description: "MOVO Terms & Conditions",
};

export default function TermsOfServicePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>MOVO Terms &amp; Conditions</h1>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </div>

        <section className={styles.section}>
          <h2>1. Eligibility</h2>
          <ul>
            <li>Movo services are available to users aged <strong>13 years and older</strong>.</li>
            <li>The service is intended for users located in <strong>Zimbabwe</strong>.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Account Creation &amp; Access</h2>
          <ul>
            <li>Users must create an account using their <strong>name and phone number</strong>.</li>
            <li>Access is secured through <strong>OTP-based login</strong> (no passwords).</li>
            <li>Users are responsible for keeping their phone number active and accessible.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Services Provided</h2>
          <ul>
            <li>
              Movo offers <strong>same-day delivery and tracking</strong> for <strong>small
              packages only</strong>.
            </li>
            <li>
              A <strong>fast delivery option</strong> is available, with prioritized delivery in
              under 1 hour.
            </li>
            <li>
              Movo does not accept <strong>illegal items</strong> (e.g., drugs, firearms) or
              <strong> highly fragile items</strong>.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Pricing &amp; Payments</h2>
          <ul>
            <li>Fees are calculated based on <strong>distance to delivery</strong>.</li>
            <li>
              Payments may be made <strong>before delivery</strong> or <strong>on delivery</strong>
              via online payment or cash.
            </li>
            <li>Fees are confirmed before dispatch.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. User Responsibilities</h2>
          <ul>
            <li>
              Users must ensure packages are <strong>properly packaged and labeled</strong>.
            </li>
            <li>Users may not send <strong>illegal or prohibited items</strong>.</li>
            <li>Users must be available at pickup and delivery locations.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Movo Responsibilities</h2>
          <ul>
            <li>Movo will take <strong>reasonable measures</strong> to ensure package safety.</li>
            <li>
              All packages will be delivered on the same day, subject to traffic and other
              conditions.
            </li>
            <li><strong>Fast delivery packages</strong> are prioritized over standard deliveries.</li>
            <li>
              If Movo directly causes damage or loss, a <strong>cash settlement</strong> may be
              agreed.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Refunds &amp; Cancellations</h2>
          <ul>
            <li>
              Users who cancel <strong>before pickup</strong> are entitled to a refund, less
              <strong> 25% administration costs</strong>.
            </li>
            <li>Once a package is picked up, cancellations are not possible.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Limitation of Liability</h2>
          <ul>
            <li>
              Movo will not be responsible for <strong>loss or damage not directly caused by
              Movo</strong>.
            </li>
            <li>Compensation is limited to cases where Movo is proven directly responsible.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>9. Intellectual Property</h2>
          <ul>
            <li>All apps, logos, and branding are the <strong>exclusive property of Movo</strong>.</li>
            <li>
              Users may not copy, modify, or distribute Movo&apos;s intellectual property.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Data &amp; Privacy</h2>
          <ul>
            <li>
              Customer data (names, phone numbers, delivery records) is stored for
              <strong> record-keeping</strong>.
            </li>
            <li>Data will not be shared with third parties except as required by law.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>11. Termination of Accounts</h2>
          <ul>
            <li>
              Movo reserves the right to terminate accounts for <strong>fraud, illegal activity, or
              misuse</strong>.
            </li>
            <li>Termination may occur without prior notice.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>12. Dispute Resolution</h2>
          <ul>
            <li>In the event of disputes, Movo prefers <strong>mediation</strong> as the first step.</li>
            <li>
              If mediation fails, disputes will be resolved through the
              <strong> Zimbabwean courts</strong>.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>13. Governing Law</h2>
          <ul>
            <li>These Terms &amp; Conditions are governed by the laws of <strong>Zimbabwe</strong>.</li>
            <li>Users agree to submit to the jurisdiction of Zimbabwean courts.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>14. Changes to Terms</h2>
          <ul>
            <li>Movo may update these Terms &amp; Conditions at any time.</li>
            <li>Users will be notified of changes when they <strong>use the app</strong>.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
