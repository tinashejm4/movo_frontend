"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import styles from "./styles.module.css"

type Task = {
  id: string
  title: string
  subtitle: string
  details: string
  time?: string
}

const pendingTasks: Task[] = [
  {
    id: "8821",
    title: "Unload Freight #8821",
    subtitle: "Bay 4 • 24 Units Pending",
    details:
      "Unload incoming freight at Bay 4, verify pallet counts, and update inventory status before sending the shipment for quality review.",
  },
  {
    id: "b12",
    title: "Audit Rack B-12",
    subtitle: "High Priority • Inventory Sync",
    details:
      "Inspect Rack B-12 inventory against the system count, reconcile discrepancies, and flag any damaged or missing items.",
  },
  {
    id: "fr900",
    title: "Restock Frontend Display",
    subtitle: "Low Priority • SKU: FR-900",
    details:
      "Move the latest products to the frontend display, confirm label placement, and refresh the stock feed for the customer-facing area.",
  },
]

const upcomingTasks: Task[] = [
  {
    id: "fedex",
    title: "FedEx Pickup - Express",
    subtitle: "12 Parcels • Dock A",
    time: "11:00 AM",
    details:
      "Prepare paperwork and staging for the FedEx express pickup at Dock A. Verify parcel counts and hand off the manifest to the driver.",
  },
  {
    id: "sync",
    title: "Inventory Team Sync",
    subtitle: "Meeting Room C • Q4 Planning",
    time: "01:30 PM",
    details:
      "Join the inventory sync meeting to review stock levels, prioritize replenishment tasks, and align on the Q4 distribution plan.",
  },
  {
    id: "delivery",
    title: "Bulk Order Delivery",
    subtitle: "Vendor: SupplyCo • 5 Pallets",
    time: "Tomorrow",
    details:
      "Coordinate the bulk order delivery with SupplyCo, verify the shipment contents, and arrange the pallets in the holding area.",
  },
]

export default function StaffDashboard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const openTask = (task: Task) => setSelectedTask(task)
  const closeTask = () => setSelectedTask(null)

  return (
    <main className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Image src="/movo-logo.svg" alt="MOVO" width={168} height={40} className={styles.logoImage} priority />
        </div>
        <p className={styles.subtext}>Reliable & Efficient</p>

        <nav className={styles.nav} aria-label="Staff navigation">
          <Link href="/staff" className={styles.navItem} aria-current="page">
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </Link>
          <Link href="/staff/receive" className={styles.navItem}>
            <span className={styles.navIcon}>📥</span>
            Receiving
          </Link>
          <Link href="/staff/dispatch" className={styles.navItem}>
            <span className={styles.navIcon}>🚚</span>
            Dispatch
          </Link>
          <Link href="/staff/batches" className={styles.navItem}>
            <span className={styles.navIcon}>📋</span>
            Batches
          </Link>
          <Link href="/staff/expenses" className={styles.navItem}>
            <span className={styles.navIcon}>🧾</span>
            Expenses
          </Link>
          <Link href="/staff/accounts" className={styles.navItem}>
            <span className={styles.navIcon}>🏦</span>
            Accounts
          </Link>
        </nav>

        <div className={styles.footerLinks}>
          <Link href="#settings" className={styles.footerLink}>Settings</Link>
          <Link href="/staff/login" className={styles.footerLink}>Logout</Link>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.greetingLabel}>Good Morning, Alex</p>
            <p className={styles.greeting}>Monday, June 8</p>
          </div>

          <div className={styles.topRight}> 
            <div className={styles.timeCard}>
              <span className={styles.timeLabel}>CURRENT TIME</span>
              <strong>01:02 PM</strong>
            </div>
            <div className={styles.iconCircle}>🔔</div>
            <div className={styles.avatar} title="Profile">👤</div>
          </div>
        </header>

        <div className={styles.taskArea}>
          <div className={styles.taskPanel}>
            <div className={styles.panelHeader}>
              <span>Pending Tasks</span>
              <span className={styles.badge}>4 Urgent</span>
            </div>
            <ul className={styles.taskList}>
              {pendingTasks.map((task) => (
                <li key={task.id} className={styles.taskListItem}>
                  <button
                    type="button"
                    onClick={() => openTask(task)}
                    className={styles.taskButton}
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <span className={styles.taskSubtitle}>{task.subtitle}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <a href="#" className={styles.panelLink}>View All Pending Tasks</a>
          </div>

          <div className={styles.taskPanel}>
            <div className={styles.panelHeader}>
              <span>Upcoming Tasks</span>
              <span className={styles.badgeBlue}>3 Scheduled</span>
            </div>
            <ul className={styles.taskList}>
              {upcomingTasks.map((task) => (
                <li key={task.id} className={styles.taskListItem}>
                  <button
                    type="button"
                    onClick={() => openTask(task)}
                    className={styles.taskButton}
                  >
                    <div>
                      <strong>{task.title}</strong>
                      <span className={styles.taskSubtitle}>{task.subtitle}</span>
                    </div>
                    <strong className={styles.taskTime}>{task.time}</strong>
                  </button>
                </li>
              ))}
            </ul>
            <a href="#" className={styles.panelLink}>Open Full Calendar</a>
          </div>
        </div>

        {selectedTask && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalLabel}>Task Details</p>
                  <h2 id="task-modal-title" className={styles.modalTitle}>{selectedTask.title}</h2>
                </div>
                <button type="button" onClick={closeTask} className={styles.modalClose}>
                  Close
                </button>
              </div>
              <p className={styles.modalMeta}>{selectedTask.subtitle}</p>
              {selectedTask.time && <p className={styles.modalMeta}>Time: {selectedTask.time}</p>}
              <p className={styles.modalDescription}>{selectedTask.details}</p>
            </div>
          </div>
        )}

        <div className={styles.statusRow}>
          <div className={styles.statusCard}>
            <span>EFFICIENCY</span>
            <strong>94.2%</strong>
          </div>
          <div className={styles.statusCard}>
            <span>STORAGE CAP</span>
            <strong>78%</strong>
          </div>
          <div className={styles.statusCard}>
            <span>TRANSIT ITEMS</span>
            <strong>14</strong>
          </div>
          <div className={styles.statusCardRed}>
            <span>FLAGGED</span>
            <strong>2</strong>
          </div>
        </div>
      </section>
    </main>
  )
}
