import type { Metadata } from "next";
import Link from "next/link";
import PackageTracker from "./packageTracker";
import styles from "./styles.module.css";

export const metadata: Metadata = {
  title: "About Us | MOVO",
  description: "Learn about MOVO's mission, values, team, milestones, and future direction.",
};

const values = ["Reliability first", "Security by design", "Transparent pricing", "People-centered service"];

const milestones = [
  {
    title: "Harare Launch Completed",
    detail: "Launched same-day delivery operations in Harare with active daily dispatch.",
    period: "Q1 2026",
    status: "met",
  },
  {
    title: "Reliability Benchmark Achieved",
    detail: "Reached 99.8% on-time reliability in active delivery zones.",
    period: "Q2 2026",
    status: "met",
  },
  {
    title: "Community Expansion",
    detail: "Delivered 1000 packages in Harare.",
    period: "Q4 2026",
    status: "upcoming",
  },
  {
    title: "Enterprise API Integrations",
    detail: "Launch robust integrations for high-volume merchants and partners.",
    period: "Q1 2027",
    status: "upcoming",
  },
] as const;

export default function AboutUsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>About MOVO</p>
          <h1>Built to Move Zimbabwe Forward.</h1>
          <p className={styles.lead}>
            We are a logistics technology team helping businesses and households send, track, and
            receive packages faster, safer, and at fair prices.
          </p>
          <Link href="/" className={styles.backLink}>
            Back to Home
          </Link>
        </header>

        <section className={styles.section}>
          <h2>Mission Statement</h2>
          <p>
            Our mission is to make delivery in Zimbabwe dependable, affordable, and secure by
            combining smart routing, trusted couriers, and clear customer communication.
          </p>
          <PackageTracker />
        </section>

        <section className={styles.section}>
          <h2>Vision &amp; Values</h2>
          <p>
            Our long-term vision is to become Zimbabwe&apos;s most trusted movement layer for parcels,
            products, and time-sensitive deliveries across every major city.
          </p>
          <ul className={styles.chipList}>
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Our Story</h2>
          <p>
            The vision for MOVO began when we saw how Zimbabwe’s delivery 
            industry remained too expensive and overly traditional, 
            leaving everyday customers and small businesses underserved. 
            Delivery was treated as a luxury, not a necessity, and this gap was holding 
            back the growth of e‑commerce.

        </p>
        <p> 

            We realised that the high cost of logistics and outdated systems 
            were a major reason why Zimbabwe’s online shopping sector is 
            still smaller than in other countries. Merchants selling through 
            WhatsApp or Facebook Marketplace struggled to reach customers 
            affordably, while buyers often chose to “go get it themselves” 
            rather than pay steep delivery fees.
        </p>
        <p>
            MOVO was born to change that. By combining technology‑driven 
            workflows with community‑focused logistics, we aim to make 
            delivery accessible, affordable, and reliable, unlocking the true 
            potential of Zimbabwean e‑commerce. Our story is about more than 
            packages. It is about building trust, empowering merchants, and 
            connecting communities.
        </p>
        </section>

        <section className={styles.section}>
          <h2>Team Introduction</h2>
          <div className={styles.teamGrid}>
            <article className={styles.teamCard}>
              <h3>Product &amp; Operations Lead</h3>
              <p>
                The leaders that drive the vision and execution of MOVO, balancing customer needs, pricing,
                service quality, and operational excellence.
              </p>
            </article>
            <article className={styles.teamCard}>
              <h3>Engineering &amp; Platform Collaborators</h3>
              <p>
                Your collaborators build reliable systems for tracking, dispatch, account workflows,
                and performance insights that keep daily operations smooth.
              </p>
            </article>
            <article className={styles.teamCard}>
              <h3>Courier &amp; Support Network</h3>
              <p>
                Field and support teams bring the experience to life through secure handling,
                accurate updates, and responsive customer care.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Unique Value Proposition</h2>
          <p>
            MOVO combines low entry pricing, high delivery reliability, and secure handover features
            in one experience. Unlike many alternatives, we prioritize both affordability and
            accountability without making customers choose one over the other.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Achievements &amp; Milestones</h2>
          <ul className={styles.timeline} aria-label="MOVO milestone timeline">
            {milestones.map((item) => (
              <li key={item.title} className={styles.timelineItem}>
                <span
                  className={`${styles.timelineDot} ${item.status === "met" ? styles.dotMet : styles.dotUpcoming}`}
                  aria-hidden="true"
                />
                <article className={styles.timelineCard}>
                  <div className={styles.timelineHeader}>
                    <p className={styles.timelinePeriod}>{item.period}</p>
                    <span
                      className={`${styles.timelineBadge} ${item.status === "met" ? styles.badgeMet : styles.badgeUpcoming}`}
                    >
                      {item.status === "met" ? "Met" : "In Progress"}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Future Outlook</h2>
          <p>
            Looking ahead, we are also introducing an innovative aggregation model where packages are consolidated into bulk shipments. 
            This approach will dramatically reduce costs, bringing delivery fees to less than a dollar per package while 
            maintaining reliability and transparency. By combining smarter technology with community‑driven l
            ogistics, we aim to unlock the full potential of Zimbabwe’s e‑commerce ecosystem.
          </p>
        </section>

        <section className={`${styles.section} ${styles.ctaSection}`}>
          <h2>Let&apos;s Build Together</h2>
          <p>
            We welcome recruiters, partners, and collaborators who care about high-impact products
            and operational excellence.
          </p>
          <div className={styles.ctaRow}>
            <a href="mailto:info@movo.co.zw" className={styles.primaryCta}>
              Contact the Team
            </a>
            <a href="/" className={styles.secondaryCta}>
              Explore MOVO
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}