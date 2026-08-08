import type { Metadata } from "next";
import Link from "next/link";
import styles from "../terms-of-service/styles.module.css";

export const metadata: Metadata = {
  title: "Help Center | MOVO",
  description: "MOVO Help Center",
};

export default function HelpCenterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1>MOVO Help Center</h1>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </div>

        <section className={styles.section}>
          <h2>Getting Started</h2>
          <p>
            <strong>Q: How do I create a Movo account?</strong>
            <br />
            A: Simply enter your <strong>name and phone number</strong> in the app. You&apos;ll log
            in using a <strong>one-time password (OTP)</strong> sent to your phone - no need to
            remember passwords.
          </p>
          <p>
            <strong>Q: How do I request a delivery?</strong>
            <br />
            A: Open the app, enter the <strong>pickup and drop-off addresses</strong>, confirm the
            package details, and choose your delivery option (same-day or fast delivery).
          </p>
          <p>
            <strong>Q: How can I track my package?</strong>
            <br />
            A: Once your package is dispatched, you can track it in real time through the app&apos;s
            <strong> tracking feature</strong>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Services &amp; Features</h2>
          <p>
            <strong>Q: What types of packages can I send with Movo?</strong>
            <br />
            A: Movo delivers <strong>small packages only</strong>. We do not carry illegal items
            (such as drugs or firearms) or highly fragile items.
          </p>
          <p>
            <strong>Q: What is the fast delivery option?</strong>
            <br />
            A: Fast delivery ensures your package is delivered in <strong>under 1 hour</strong>,
            with priority over standard deliveries.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Payments &amp; Fees</h2>
          <p>
            <strong>Q: How are delivery fees calculated?</strong>
            <br />
            A: Fees are based on the <strong>distance between pickup and delivery locations</strong>.
          </p>
          <p>
            <strong>Q: How can I pay for my delivery?</strong>
            <br />
            A: You can pay <strong>online</strong> or in <strong>cash on delivery</strong>.
          </p>
          <p>
            <strong>Q: What happens if I cancel my delivery?</strong>
            <br />
            A: If you cancel <strong>before pickup</strong>, you&apos;ll receive a refund minus
            <strong> 25% administration costs</strong>. Once pickup is complete, cancellations are
            not possible.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Safety &amp; Liability</h2>
          <p>
            <strong>Q: How does Movo ensure package safety?</strong>
            <br />
            A: We take <strong>reasonable measures</strong> to protect packages during transit.
          </p>
          <p>
            <strong>Q: What if my package is lost or damaged?</strong>
            <br />
            A: If Movo directly causes the loss or damage, a <strong>cash settlement</strong> may
            be agreed. Movo is not responsible for issues outside its direct control.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Account &amp; Privacy</h2>
          <p>
            <strong>Q: How do I log in to my account?</strong>
            <br />
            A: You&apos;ll receive an <strong>OTP code</strong> on your phone each time you log in.
          </p>
          <p>
            <strong>Q: What data does Movo store?</strong>
            <br />
            A: We store your <strong>name, phone number, and delivery records</strong> for
            record-keeping. Your data is not shared with third parties unless required by law.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Troubleshooting</h2>
          <p>
            <strong>Q: I didn&apos;t receive my OTP. What should I do?</strong>
            <br />
            A: Check your phone&apos;s network connection and ensure your number is correct. If the
            issue persists, contact Movo support.
          </p>
          <p>
            <strong>Q: My package is delayed. What should I do?</strong>
            <br />
            A: Delivery times may vary due to traffic or unforeseen events. Please check the app&apos;s
            tracking feature or contact support.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact &amp; Support</h2>
          <p>
            <strong>Q: How can I contact Movo support?</strong>
            <br />
            A: You can reach us via <strong>phone, WhatsApp, or email</strong>. Support hours are
            <strong> 8 AM - 8 PM daily</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}