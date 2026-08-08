import type { Metadata } from "next";
import Link from "next/link";
import styles from "../terms-of-service/styles.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | MOVO",
  description: "MOVO Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>MOVO Privacy Policy</h1>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </div>

        <section className={styles.section}>
          <h2>1. Information We Collect</h2>
          <ul>
            <li>
              <strong>Personal Information</strong>: Name and phone number provided during account
              creation.
            </li>
            <li>
              <strong>Delivery Information</strong>: Pickup and drop-off addresses, package
              details, and delivery records.
            </li>
            <li>
              <strong>Usage Data</strong>: Basic app activity such as delivery requests, payment
              confirmations, and tracking logs.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage user accounts.</li>
            <li>To process and complete deliveries.</li>
            <li>To calculate fees and confirm payments.</li>
            <li>To maintain records for operational and legal purposes.</li>
            <li>To improve service quality and resolve disputes.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Data Storage &amp; Security</h2>
          <ul>
            <li>
              Customer data is stored securely by Movo for <strong>record-keeping</strong>.
            </li>
            <li>
              Reasonable technical and organizational measures are taken to protect data against
              unauthorized access, loss, or misuse.
            </li>
            <li>
              Data is retained only as long as necessary for service provision and compliance with
              Zimbabwean law.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Sharing of Information</h2>
          <ul>
            <li>Movo does not sell or share customer data with third parties.</li>
            <li>Data may be disclosed if required by law or to enforce our Terms &amp; Conditions.</li>
            <li>
              Limited information may be shared with delivery partners strictly for completing
              deliveries.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Payments &amp; Financial Data</h2>
          <ul>
            <li>Payment details (online or cash) are processed securely.</li>
            <li>
              Movo does not store sensitive financial information beyond transaction records
              necessary for accounting.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. User Rights</h2>
          <ul>
            <li>Users may request access to their personal data stored by Movo.</li>
            <li>Users may request correction of inaccurate information.</li>
            <li>
              Users may request deletion of their account and associated data, subject to legal and
              operational requirements.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Account Termination</h2>
          <ul>
            <li>
              If an account is terminated (fraud, illegal activity, misuse), Movo may retain
              necessary records for compliance and dispute resolution.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Dispute Resolution</h2>
          <ul>
            <li>
              Privacy-related disputes will first be addressed through <strong>mediation</strong>.
            </li>
            <li>
              If unresolved, disputes will be handled under the jurisdiction of
              <strong> Zimbabwean courts</strong>.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>9. Updates to Policy</h2>
          <ul>
            <li>Movo may update this Privacy Policy from time to time.</li>
            <li>Users will be notified of changes when they <strong>use the app</strong>.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}