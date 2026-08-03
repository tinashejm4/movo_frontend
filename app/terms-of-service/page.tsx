import type { Metadata } from "next";
import Link from "next/link";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | MOVO",
  description: "MOVO Terms of Service",
};

export default function TermsOfServicePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>MOVO Terms of Service</h1>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </div>

        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            Welcome to MOVO. By using our courier and delivery services, you agree to the following
            Terms of Service. These terms are designed to protect both you, the customer, and MOVO
            as the service provider.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Services Provided</h2>
          <ul>
            <li>
              MOVO offers same-day and scheduled courier deliveries within Harare and surrounding
              areas.
            </li>
            <li>
              We provide package pickup, secure handling, and delivery to the specified recipient.
            </li>
            <li>Service availability may vary depending on location and demand.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Pricing and Payment</h2>
          <ul>
            <li>
              Delivery fees start at $1.00 and may vary based on distance, package size, and
              service type.
            </li>
            <li>Payments must be made through approved methods (cash, EcoCash, or in-app payment).</li>
            <li>
              Prices are subject to change, but customers will always be informed before confirming
              an order.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Customer Responsibilities</h2>
          <ul>
            <li>
              Ensure packages are properly sealed and labeled with accurate recipient details.
            </li>
            <li>
              Do not send prohibited items (for example: hazardous materials, illegal goods, cash
              exceeding legal limits).
            </li>
            <li>Be available for pickup and delivery at the agreed times.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. MOVO Responsibilities</h2>
          <ul>
            <li>Deliver packages safely, securely, and within the agreed timeframe.</li>
            <li>Provide real-time tracking and customer support.</li>
            <li>
              Handle packages with care and maintain confidentiality of customer information.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Liability</h2>
          <ul>
            <li>
              MOVO is not liable for delays caused by traffic, weather, or circumstances beyond our
              control.
            </li>
            <li>MOVO is not responsible for damages caused by improper packaging.</li>
            <li>
              In case of loss or damage, compensation will be limited to the declared value of the
              package, subject to investigation.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>7. Security and Privacy</h2>
          <ul>
            <li>MOVO uses secure systems to protect customer data and package information.</li>
            <li>
              Personal information will not be shared with third parties except as required by law.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Cancellation and Refunds</h2>
          <ul>
            <li>Orders may be canceled before pickup without charge.</li>
            <li>Once a package is picked up, cancellations are not possible.</li>
            <li>
              Refunds will be processed only in cases of service failure attributable to MOVO.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>9. Amendments</h2>
          <p>
            MOVO reserves the right to update these Terms of Service. Customers will be notified of
            significant changes via the website or app.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Contact</h2>
          <p>For questions or support, please contact our customer service team at:</p>
          <p>
            Phone: <a href="tel:+263716633349">+263716633349</a>
            <br />
            Email: <a href="mailto:support@movo.co.zw">support@movo.co.zw</a>
          </p>
        </section>
      </div>
    </main>
  );
}
