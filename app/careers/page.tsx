import type { Metadata } from "next";
import Link from "next/link";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "Careers | MOVO",
  description: "Current open positions at MOVO.",
};

const openings = [
  {
    title: "Biker Courier - Urban Routes",
    location: "Harare",
    license: "Class 3",
    experience: "1 year",
    type: "Full-time",
    shift: "Day shift",
  },
  {
    title: "Biker Courier - Same-Day Operations",
    location: "Harare",
    license: "Class 3",
    experience: "1 year",
    type: "Full-time",
    shift: "Flexible shift",
  },
];

export default function CareersPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.headerRow}>
          <div>
            <p className={styles.eyebrow}>Join MOVO</p>
            <h1>Careers</h1>
            <p>
              We are currently hiring riders who care about reliable service and professional
              customer experience.
            </p>
          </div>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </header>

        <section className={styles.section}>
          <h2>Open Positions</h2>
          <div className={styles.cards}>
            {openings.map((role) => (
              <article key={role.title} className={styles.card}>
                <h3>{role.title}</h3>
                <ul>
                  <li>
                    <strong>Location:</strong> {role.location}
                  </li>
                  <li>
                    <strong>License:</strong> {role.license}
                  </li>
                  <li>
                    <strong>Experience:</strong> {role.experience}
                  </li>
                  <li>
                    <strong>Employment:</strong> {role.type}
                  </li>
                  <li>
                    <strong>Shift:</strong> {role.shift}
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Basic Requirements</h2>
          <ul className={styles.requirements}>
            <li>Valid Class 3 licence.</li>
            <li>Minimum 1 year riding or courier experience.</li>
            <li>Good knowledge of Harare roads and neighborhoods.</li>
            <li>Professional communication and punctuality.</li>
          </ul>
          <p className={styles.applyLine}>
            To apply, send your CV to <a href="mailto:hr@movo.co.zw">hr@movo.co.zw</a> with
            the subject line: <strong>Biker Application - Harare</strong>.
          </p>
        </section>
      </div>
    </main>
  );
}