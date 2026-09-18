"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function AdminBikersPage() {
  const router = useRouter()

  useEffect(() => {
    if (!window.sessionStorage.getItem("movo_access_token")) router.replace("/adminportal/login")
  }, [router])

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/admin" className={styles.backLink}>Back to dashboard</Link>
          <p className={styles.eyebrow}>Movo administration</p>
          <h1>Bikers</h1>
          <p className={styles.intro}>Manage the bikers responsible for deliveries.</p>
        </div>
      </header>

      <section className={styles.panel} aria-labelledby="bikers-heading">
        <h2 id="bikers-heading">Biker management</h2>
        <p>The biker management workspace is ready for biker records and delivery assignments.</p>
      </section>
    </main>
  )
}
